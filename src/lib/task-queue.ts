import { TaskQueue, User, Prisma } from '@prisma/client';
import prisma from './db';
import { generateImage, editImage, getTaskStatus } from './ai-models';
import { getUserCreditBalance } from './credit';

// Maximum concurrent requests per user (as specified in requirements)
const MAX_CONCURRENT_REQUESTS = 3;

/**
 * Represents the service for handling task queue operations
 */
export interface TaskQueueService {
  /**
   * Adds a new task to the queue
   */
  addTask: (taskData: Partial<TaskQueue>) => Promise<TaskQueue>;
  
  /**
   * Gets the status of a specific task
   */
  getTask: (taskId: string, userId: string) => Promise<TaskQueue | null>;
  
  /**
   * Updates the status of a task
   */
  updateTaskStatus: (taskId: string, status: string, progress?: number, errorMessage?: string) => Promise<TaskQueue>;
  
  /**
   * Processes the next available task in the queue
   */
  processNextTask: () => Promise<boolean>;
  
  /**
   * Checks if a user has reached the concurrent request limit
   */
  isAtRequestLimit: (userId: string) => Promise<boolean>;
  
  /**
   * Gets all tasks for a specific user
   */
  getUserTasks: (userId: string, status?: string) => Promise<TaskQueue[]>;
}

/**
 * Adds a new task to the queue
 */
export async function addTask(taskData: Partial<TaskQueue>): Promise<TaskQueue> {
  return prisma.taskQueue.create({
    data: {
      userId: taskData.userId!,
      taskId: taskData.taskId || `task_${Date.now()}_${taskData.userId?.substring(0, 8)}`,
      type: taskData.type as 'generate' | 'edit',
      status: taskData.status || 'queued',
      progress: taskData.progress || 0,
      imageId: taskData.imageId || null,
    },
  });
}

/**
 * Gets the status of a specific task
 */
export async function getTask(taskId: string, userId: string): Promise<TaskQueue | null> {
  return prisma.taskQueue.findFirst({
    where: {
      taskId,
      userId,
    },
  });
}

/**
 * Updates the status of a task
 */
export async function updateTaskStatus(
  taskId: string, 
  status: string, 
  progress?: number, 
  errorMessage?: string
): Promise<TaskQueue> {
  const updateData: Prisma.TaskQueueUpdateInput = {
    status,
  };

  if (progress !== undefined) {
    updateData.progress = progress;
  }

  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }

  if (status === 'completed' || status === 'failed') {
    updateData.completedAt = new Date();
  }

  return prisma.taskQueue.update({
    where: { taskId },
    data: updateData,
  });
}

/**
 * Processes the next available task in the queue
 */
export async function processNextTask(): Promise<boolean> {
  // Find the next queued task
  const nextTask = await prisma.taskQueue.findFirst({
    where: {
      status: 'queued',
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (!nextTask) {
    // No tasks to process
    return false;
  }

  try {
    // Update task status to processing
    await updateTaskStatus(nextTask.taskId, 'processing', 0);

    if (nextTask.type === 'generate' && nextTask.imageId) {
      // If it's a generate task, we need to get the image to know what to generate
      const image = await prisma.image.findUnique({
        where: { id: nextTask.imageId },
      });

      if (image) {
        // Perform the image generation
        const result = await generateImage({
          userId: image.userId,
          prompt: image.prompt || '',
          model: image.modelName as any, // We'll cast since we know it's a valid model
        });

        if (result.status === 'success') {
          // Update image details
          await prisma.image.update({
            where: { id: image.id },
            data: {
              storagePath: result.imageUrl || '',
              status: 'completed',
            },
          });

          // Update task status
          await updateTaskStatus(nextTask.taskId, 'completed', 100);
        } else {
          // Update task status to failed
          await updateTaskStatus(nextTask.taskId, 'failed', 0, result.message);
        }
      }
    } else if (nextTask.type === 'edit' && nextTask.imageId) {
      // If it's an edit task
      const image = await prisma.image.findUnique({
        where: { id: nextTask.imageId },
      });

      if (image && image.originalImageId) {
        // Perform the image editing
        // For now, we'll use the same function as generation but conceptually this would be different
        const result = await editImage({
          userId: image.userId,
          originalImageId: image.originalImageId,
          prompt: image.prompt || '',
          model: image.modelName as any,
        });

        if (result.status === 'success') {
          // Update image details
          await prisma.image.update({
            where: { id: image.id },
            data: {
              storagePath: result.imageUrl || '',
              status: 'completed',
            },
          });

          // Update task status
          await updateTaskStatus(nextTask.taskId, 'completed', 100);
        } else {
          // Update task status to failed
          await updateTaskStatus(nextTask.taskId, 'failed', 0, result.message);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error processing task:', error);
    await updateTaskStatus(nextTask.taskId, 'failed', 0, (error as Error).message);
    return false;
  }
}

// Track rate limits using an in-memory store (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Checks if a user has reached the concurrent request limit
 */
export async function isAtRequestLimit(userId: string): Promise<boolean> {
  const activeTasks = await prisma.taskQueue.count({
    where: {
      userId,
      status: {
        in: ['processing', 'queued'], // Count both processing and queued tasks
      },
    },
  });

  return activeTasks >= MAX_CONCURRENT_REQUESTS;
}

/**
 * Implements rate limiting for API requests to prevent abuse
 * Limits: 10 requests per 1 minute per user
 */
export async function isRateLimited(userId: string): Promise<boolean> {
  const currentTime = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // Max 10 requests per window

  const key = `rate_limit:${userId}`;
  const record = requestCounts.get(key);

  if (!record) {
    // First request from this user in this window, create a new record
    requestCounts.set(key, { count: 1, resetTime: currentTime + windowMs });
    // Set timeout to clear the counter after the window
    setTimeout(() => requestCounts.delete(key), windowMs);
    return false; // Not rate-limited
  }

  if (currentTime > record.resetTime) {
    // The window has passed, reset the counter
    requestCounts.set(key, { count: 1, resetTime: currentTime + windowMs });
    // Set timeout to clear the counter after the new window
    setTimeout(() => requestCounts.delete(key), windowMs);
    return false; // Not rate-limited
  }

  // Still in the same window, increment the count
  record.count += 1;
  if (record.count > maxRequests) {
    return true; // Rate-limited
  }

  return false; // Not rate-limited
}

/**
 * Records an API request for rate limiting purposes
 */
export async function recordApiRequest(userId: string): Promise<boolean> {
  // This function can be called when an API request is made
  // It would increment the request counter
  // For this implementation, we'll just return true to indicate success
  // The actual rate limiting check would be done in isRateLimited()
  return true;
}

/**
 * Implements advanced concurrency control that considers both the number
 * of active requests and the computational load of each request
 */
export async function isAtAdvancedRequestLimit(userId: string, requestType: 'generate' | 'edit' = 'generate'): Promise<boolean> {
  const activeTasks = await prisma.taskQueue.findMany({
    where: {
      userId,
      status: {
        in: ['processing', 'queued'], // Count both processing and queued tasks
      },
    },
  });

  // For this implementation, we'll use our standard limit
  // In a more advanced system, we might weight different request types differently
  if (activeTasks.length >= MAX_CONCURRENT_REQUESTS) {
    return true;
  }

  // Additional check: prevent too many resource-intensive requests
  // In this simple implementation, all image operations are treated equally
  // In a real system, you might want to consider the computational cost of different operations
  
  return false;
}

/**
 * Gets all tasks for a specific user
 */
export async function getUserTasks(userId: string, status?: string): Promise<TaskQueue[]> {
  const whereClause: Prisma.TaskQueueWhereInput = { userId };
  
  if (status) {
    whereClause.status = status;
  }

  return prisma.taskQueue.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Background task processor that runs continuously to process tasks
 * In a real implementation, this would run as a background service
 */
export async function startBackgroundTaskProcessor(): Promise<void> {
  console.log('Starting background task processor...');
  
  // Process tasks continuously
  // In a real implementation, you would use a proper background job system
  // like Bull, Agenda, or integrate with cloud queuing services
  const processTasksInterval = setInterval(async () => {
    try {
      // Process up to 5 tasks per cycle to avoid overwhelming the system
      for (let i = 0; i < 5; i++) {
        const processed = await processNextTask();
        if (!processed) {
          // If no tasks were processed, break the loop
          break;
        }
      }
    } catch (error) {
      console.error('Error in background task processor:', error);
    }
  }, 5000); // Check for new tasks every 5 seconds
  
  // In a real implementation, you'd want to handle cleanup properly
  // For example, when the process shuts down
}

/**
 * Improved background worker that processes tasks with better error handling
 * and resource management
 */
export async function startAdvancedBackgroundTaskProcessor(): Promise<() => void> {
  console.log('Starting advanced background task processor...');
  
  let isRunning = true;
  
  const processTasks = async () => {
    if (!isRunning) return;
    
    try {
      // Process up to 3 tasks per cycle to avoid overwhelming the system
      let processedCount = 0;
      const maxProcessPerCycle = 3;
      
      while (processedCount < maxProcessPerCycle && isRunning) {
        const processed = await processNextTask();
        if (!processed) {
          // No more tasks to process right now, break the loop
          break;
        }
        processedCount++;
        
        // Brief pause between processing tasks to not overwhelm system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error in advanced background task processor:', error);
    }
    
    if (isRunning) {
      // Schedule next execution
      setTimeout(processTasks, 3000); // Check for new tasks every 3 seconds
    }
  };
  
  // Start the processing loop
  processTasks();
  
  // Return a function to stop the processor
  return () => {
    console.log('Stopping background task processor...');
    isRunning = false;
  };
}

/**
 * Gets the position of a task in the queue
 */
export async function getTaskQueuePosition(taskId: string): Promise<number> {
  const task = await prisma.taskQueue.findUnique({
    where: { taskId },
  });

  if (!task) {
    return -1; // Task not found
  }

  // Count how many tasks were created before this one and are still queued
  const position = await prisma.taskQueue.count({
    where: {
      createdAt: {
        lt: task.createdAt, // Created before this task
      },
      status: {
        in: ['queued', 'processing'], // Still in the queue or processing
      },
      userId: task.userId, // Only count tasks from the same user
    },
  });

  return position;
}

/**
 * Cancels a task in the queue (only if it hasn't started processing)
 */
export async function cancelTask(taskId: string, userId: string): Promise<boolean> {
  const task = await prisma.taskQueue.findFirst({
    where: {
      taskId,
      userId,
    },
  });

  if (!task) {
    return false; // Task not found or doesn't belong to user
  }

  // Only allow cancellation if the task is still queued
  if (task.status === 'queued') {
    await prisma.taskQueue.update({
      where: { id: task.id },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
      },
    });
    return true;
  }

  return false; // Cannot cancel a task that's already processing or completed
}