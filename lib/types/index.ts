// Type definitions for the AI Image Generation and Editing Website

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  creditBalance: number;
  registrationDate: Date;
  lastLogin?: Date;
  socialLoginProvider?: string;
  isActive: boolean;
  role?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  transactionType: 'CREDIT_PURCHASE' | 'CREDIT_BONUS' | 'IMAGE_GENERATION' | 'IMAGE_EDIT';
  amount: number; // Positive for additions, negative for deductions
  date: Date;
  description: string;
  aiModelUsed?: string;
}

export interface Image {
  id: string;
  userId: string;
  originalFilename: string;
  storagePath: string;
  creationDate: Date;
  prompt?: string;
  fileFormat: string;
  fileSize: number;
  imageType: 'UPLOADED' | 'GENERATED' | 'EDITED';
  originalImageId?: string;
  modelName?: string;
  status: string;
}

export interface AIModel {
  id: string;
  name: string;
  usageCount: number;
  lastAccessTime?: Date;
  costPerUse: number;
  isActive: boolean;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  publicationDate?: Date;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  lastModified?: Date;
  imageUrl?: string | null;
}

export interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  expirationTime: Date;
  createdAt: Date;
}

// Request/Response types for API endpoints

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  userId?: string;
  email?: string;
  creditBalance?: number;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  sessionToken?: string;
  user?: {
    id: string;
    email: string;
    creditBalance: number;
  };
  error?: string;
}

export interface LogoutRequest {
  sessionToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface GenerateImageRequest {
  prompt: string;
  aiModel: string;
  sessionToken: string;
}

export interface GenerateImageResponse {
  success: boolean;
  imageId?: string;
  imageUrl?: string;
  creditsUsed?: number;
  finalCreditBalance?: number;
  message?: string;
  error?: string;
  requiredCredits?: number;
  currentCredits?: number;
}

export interface EditImageRequest {
  imageId: string;
  prompt: string;
  aiModel: string;
  sessionToken: string;
}

export interface EditImageResponse {
  success: boolean;
  imageId?: string;
  imageUrl?: string;
  creditsUsed?: number;
  finalCreditBalance?: number;
  originalImageId?: string;
  message?: string;
  error?: string;
}

export interface UploadImageRequest {
  file: File;
  sessionToken: string;
}

export interface UploadImageResponse {
  success: boolean;
  imageId?: string;
  filename?: string;
  message?: string;
  error?: string;
}