import { PrismaClient, User } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/auth';

const prisma = new PrismaClient();

export interface CreateUserInput {
  email: string;
  password: string;
  socialLoginProvider?: string;
}

export interface UpdateUserInput {
  id: string;
  email?: string;
  password?: string;
  creditBalance?: number;
  lastLogin?: Date;
  isActive?: boolean;
}

export class UserService {
  /**
   * Creates a new user with an initial credit balance of 100
   */
  async createUser(input: CreateUserInput): Promise<User> {
    const { email, password, socialLoginProvider } = input;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Create the user with initial 100 credits
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        creditBalance: 100, // Initial free credits
        socialLoginProvider,
        registrationDate: new Date(),
        isActive: true
      }
    });
    
    return user;
  }

  /**
   * Finds a user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Finds a user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  /**
   * Authenticates a user by email and password
   */
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return null;
    }
    
    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    return user;
  }

  /**
   * Updates user information
   */
  async updateUser(input: UpdateUserInput): Promise<User> {
    const { id, ...updateData } = input;
    
    // If password is being updated, hash it
    if (updateData.password) {
      const passwordHash = await hashPassword(updateData.password);
      delete updateData.password;
      
      return prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          passwordHash
        }
      });
    }
    
    return prisma.user.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Updates user's credit balance by a specific amount
   */
  async updateUserCreditBalance(userId: string, amount: number): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Ensure the new balance doesn't go below 0
    const newBalance = Math.max(0, user.creditBalance + amount);
    
    return prisma.user.update({
      where: { id: userId },
      data: { creditBalance: newBalance }
    });
  }

  /**
   * Checks if a user has sufficient credits
   */
  async hasSufficientCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const user = await this.findUserById(userId);
    
    if (!user) {
      return false;
    }
    
    return user.creditBalance >= requiredCredits;
  }

  /**
   * Gets all users with optional pagination
   */
  async getAllUsers(limit?: number, offset?: number): Promise<User[]> {
    return prisma.user.findMany({
      skip: offset || 0,
      take: limit || 50
    });
  }
}