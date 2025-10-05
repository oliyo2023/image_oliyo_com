import { User } from '@prisma/client';
import { UserService } from './user-service';
import { generateSessionToken, verifySessionToken, hashPassword, verifyPassword } from '../utils/auth';
import { Session } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  sessionToken?: string;
  user?: Omit<User, 'passwordHash'>;
  error?: string;
}

export interface LogoutResult {
  success: boolean;
  message?: string;
}

export interface SessionInfo {
  userId: string;
  expirationTime: Date;
}

export class AuthService {
  constructor(
    public prisma: PrismaClient = new PrismaClient(),
    public userService: UserService = new UserService()
  ) {}
  /**
   * Authenticates a user and creates a session
   */
  async login(input: LoginInput): Promise<LoginResult> {
    const { email, password } = input;
    
    // Authenticate user
    const user = await this.userService.authenticateUser(email, password);
    
    if (!user) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }
    
    // Generate session token
    const sessionToken = await generateSessionToken(user.id);
    
    // Store session in database
    await this.prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });
    
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      success: true,
      sessionToken,
      user: userWithoutPassword
    };
  }

  /**
   * Logs out a user by invalidating their session
   */
  async logout(sessionToken: string): Promise<LogoutResult> {
    try {
      // Get session from database
      const session = await this.prisma.session.findUnique({
        where: { sessionToken }
      });

      if (!session) {
        return {
          success: false,
          message: 'Session not found'
        };
      }

      // Delete the session
      await this.prisma.session.delete({
        where: { sessionToken }
      });

      return {
        success: true,
        message: 'Successfully logged out'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error during logout'
      };
    }
  }

  /**
   * Verifies if a session token is valid
   */
  async verifySession(sessionToken: string): Promise<SessionInfo | null> {
    try {
      // Check if session exists in database and is not expired
      const session = await this.prisma.session.findUnique({
        where: { sessionToken }
      });

      if (!session || session.expirationTime < new Date()) {
        // Session doesn't exist or is expired
        return null;
      }

      return {
        userId: session.userId,
        expirationTime: session.expirationTime
      };
    } catch (error) {
      // If there's an error verifying the session, treat it as invalid
      return null;
    }
  }

  /**
   * Registers a new user
   */
  async register(email: string, password: string, confirmPassword: string) {
    // Validate inputs
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Create user via UserService
    const user = await this.userService.createUser({
      email,
      password
    });

    // Return success response with initial credits
    return {
      success: true,
      userId: user.id,
      email: user.email,
      creditBalance: user.creditBalance, // Should be 100
      message: 'Account created successfully with 100 free credits'
    };
  }

  /**
   * Refreshes a session token
   */
  async refreshSession(sessionToken: string): Promise<string | null> {
    // Verify the existing session
    const sessionInfo = await this.verifySession(sessionToken);

    if (!sessionInfo) {
      return null;
    }

    // Delete the old session
    await this.prisma.session.delete({
      where: { sessionToken }
    });

    // Create a new session token
    const newSessionToken = await generateSessionToken(sessionInfo.userId);
    
    // Store the new session
    await this.prisma.session.create({
      data: {
        userId: sessionInfo.userId,
        sessionToken: newSessionToken,
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    return newSessionToken;
  }
}