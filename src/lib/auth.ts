// src/lib/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db';

// Types for user authentication
interface UserRegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface UserLoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export async function registerUser(userData: UserRegistrationData): Promise<AuthResponse> {
  try {
    const { email, password, confirmPassword } = userData;

    // Validate input
    if (!email || !password || !confirmPassword) {
      return {
        success: false,
        message: 'Email, password, and confirmPassword are required'
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Invalid email format'
      };
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return {
        success: false,
        message: 'Password and confirmPassword do not match'
      };
    }

    // Validate password strength
    if (password.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long'
      };
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with 100 free credits
    const newUser = await db.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        creditBalance: 100, // 100 free credits for new users
        registrationDate: new Date()
      }
    });

    // Create initial credit transaction for registration bonus
    await db.creditTransaction.create({
      data: {
        userId: newUser.id,
        transactionType: 'earned',
        amount: 100,
        description: 'Registration bonus'
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        creditBalance: newUser.creditBalance,
        registrationDate: newUser.registrationDate
      },
      token
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      message: 'An error occurred during registration'
    };
  }
}

export async function loginUser(userData: UserLoginData): Promise<AuthResponse> {
  try {
    const { email, password } = userData;

    // Validate input
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required'
      };
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        creditBalance: user.creditBalance
      },
      token
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
}

export async function socialLogin(provider: string, socialToken: string): Promise<AuthResponse> {
  try {
    // In a real implementation, this would verify the social token with the provider
    // For now, we'll simulate the process
    
    // This is a simplified implementation - in real world you'd verify the token
    // with the provider's API and get user info
    const email = `social-${provider}-${Date.now()}@example.com`;
    
    // Check if user already exists with this social provider
    let user = await db.user.findFirst({
      where: {
        email,
        socialLoginProvider: provider
      }
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await db.user.create({
        data: {
          email,
          passwordHash: '', // No password for social login
          creditBalance: 100, // 100 free credits for new users
          registrationDate: new Date(),
          socialLoginProvider: provider
        }
      });

      // Create initial credit transaction for registration bonus
      await db.creditTransaction.create({
        data: {
          userId: user.id,
          transactionType: 'earned',
          amount: 100,
          description: 'Registration bonus'
        }
      });
    } else {
      // Update last login for existing user
      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      message: 'Social login successful',
      user: {
        id: user.id,
        email: user.email,
        creditBalance: user.creditBalance,
        socialLoginProvider: user.socialLoginProvider
      },
      token
    };
  } catch (error) {
    console.error('Error with social login:', error);
    return {
      success: false,
      message: 'An error occurred during social login'
    };
  }
}

export async function authenticateToken(token: string) {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const user = await db.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error authenticating token:', error);
    return null;
  }
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password using bcrypt
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function getUserProfile(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        creditBalance: true,
        registrationDate: true,
        lastLogin: true,
        socialLoginProvider: true,
        isActive: true,
        role: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      creditBalance: user.creditBalance,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin,
      socialLoginProvider: user.socialLoginProvider,
      isActive: user.isActive,
      role: user.role
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}