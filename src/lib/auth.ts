import { hash, compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { User, Prisma } from '@prisma/client';
import prisma from './db';

// JWT Secret should be stored in environment variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_jwt_secret_for_development'
);

// Default registration bonus
const REGISTRATION_BONUS = 100;

export interface JWTPayload {
  jti: string; // Token ID
  iat: number; // Issued at
  exp: number; // Expiration
  userId: string;
  email: string;
}

/**
 * Authenticates a user and returns a JWT token
 */
export async function authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    // Don't reveal if user exists or not for security
    return null;
  }

  // Verify password
  const isValid = await compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate JWT token
  const token = await generateToken(user);

  return {
    user: { ...user, passwordHash: '' }, // Don't return password hash
    token,
  };
}

/**
 * Registers a new user with email/password
 */
export async function registerUser(email: string, password: string, confirmPassword: string): Promise<{ user: User; token: string } | null> {
  // Validate inputs
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('Password must be at least 8 characters long with uppercase, lowercase, and number');
  }

  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash password
  const passwordHash = await hash(password, 12);

  // Create user transactionally with initial credit transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the user
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        creditBalance: REGISTRATION_BONUS,
      },
    });

    // Create the initial credit transaction
    await tx.creditTransaction.create({
      data: {
        userId: user.id,
        transactionType: 'earned',
        amount: REGISTRATION_BONUS,
        description: 'Registration bonus',
      },
    });

    return user;
  });

  // Generate JWT token
  const token = await generateToken(result);

  return {
    user: { ...result, passwordHash: '' }, // Don't return password hash
    token,
  };
}

/**
 * Handles social login or creates a new user for social login
 */
export async function socialLogin(provider: string, socialToken: string): Promise<{ user: User; token: string } | null> {
  // In a real implementation, you would verify the social token with the provider
  // For this example, we'll simulate getting user info from a social provider
  const userInfo = await verifySocialToken(provider, socialToken);
  
  if (!userInfo) {
    return null;
  }

  // Check if user exists with this email
  let user = await prisma.user.findUnique({
    where: { email: userInfo.email.toLowerCase() },
  });

  if (user) {
    // Update user with social provider info if not already set
    if (!user.socialLoginProvider) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          socialLoginProvider: provider,
          lastLogin: new Date() 
        },
      });
    } else {
      // Update last login
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    }
  } else {
    // Create new user with social login
    user = await prisma.user.create({
      data: {
        email: userInfo.email.toLowerCase(),
        passwordHash: '', // No password for social login
        creditBalance: REGISTRATION_BONUS,
        socialLoginProvider: provider,
      },
    });

    // Create the initial credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        transactionType: 'earned',
        amount: REGISTRATION_BONUS,
        description: 'Registration bonus',
      },
    });
  }

  // Generate JWT token
  const token = await generateToken(user);

  return {
    user: { ...user, passwordHash: '' }, // Don't return password hash
    token,
  };
}

/**
 * Verifies a JWT token and returns the payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload;
    
    // Type guard to ensure payload has required properties
    if (typeof payload === 'object' && payload !== null && 'userId' in payload && 'email' in payload) {
      return {
        jti: (payload as any).jti || '',
        iat: (payload as any).iat || 0,
        exp: (payload as any).exp || 0,
        userId: (payload as any).userId,
        email: (payload as any).email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Authenticates a token and returns user information
 */
export async function authenticateToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload;
    
    // Type guard to ensure payload has required properties
    if (typeof payload === 'object' && payload !== null && 'userId' in payload && 'email' in payload) {
      return {
        userId: (payload as any).userId,
        email: (payload as any).email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Token authentication failed:', error);
    return null;
  }
}

/**
 * Generates a new JWT token for a user
 */
export async function generateToken(user: User): Promise<string> {
  const token = await new SignJWT({ 
    userId: user.id, 
    email: user.email 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Token expires in 7 days
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies if an email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Simulates verification of social token with provider
 * In a real implementation, you would call the provider's API
 */
async function verifySocialToken(provider: string, socialToken: string): Promise<{ email: string; id: string } | null> {
  // Simulate different providers
  switch (provider.toLowerCase()) {
    case 'google':
      // In real implementation, verify Google token with Google API
      // This is a placeholder for demonstration
      if (socialToken.startsWith('google_')) {
        return { email: `user${Date.now()}@gmail.com`, id: `google_${Date.now()}` };
      }
      break;
    case 'facebook':
      // In real implementation, verify Facebook token with Facebook API
      if (socialToken.startsWith('facebook_')) {
        return { email: `user${Date.now()}@facebook.com`, id: `facebook_${Date.now()}` };
      }
      break;
    default:
      return null;
  }
  return null;
}

/**
 * Logout function - in a real implementation, you might add the token to a blacklist
 */
export async function logout(token: string): Promise<boolean> {
  // In a real implementation, you would add this token to a blacklist
  // until its expiration time
  return true;
}

/**
 * Gets user profile by ID
 */
export async function getUserProfile(userId: string): Promise<any | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    // Don't return password hash
    select: {
      id: true,
      email: true,
      creditBalance: true,
      registrationDate: true,
      lastLogin: true,
      socialLoginProvider: true,
      isActive: true,
      role: true,
    }
  });
}