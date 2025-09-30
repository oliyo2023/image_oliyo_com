# Data Model: Admin Permissions and UI Optimization

## Overview
This document defines the data models for the Admin Permissions and UI Optimization feature, including entities, relationships, and validation rules based on the feature specification.

## Entity: AdminUser
**Description**: Represents an administrative user account with specific permissions and role assignments

**Fields**:
- `id` (String, Primary Key): Unique identifier for the admin user
- `email` (String): Admin user's email address, must be unique and valid
- `name` (String): Admin user's display name
- `passwordHash` (String): Hashed password using bcrypt or similar
- `isActive` (Boolean): Whether the account is active (default: true)
- `roleIds` (String[]): Array of role IDs assigned to this admin user
- `createdAt` (DateTime): Date and time the account was created
- `lastLogin` (DateTime): Date and time of last login
- `personalizationSettings` (Json): JSON object containing UI personalization preferences
- `lastAccessedResource` (String, optional): ID of the last resource accessed (for locking mechanism)
- `lastAccessedResourceLockTime` (DateTime, optional): Timestamp when resource lock was acquired

**Validation Rules**:
- Email must be a valid email format
- Password must meet security requirements (min 8 chars, 1 upper, 1 lower, 1 number)
- Email must be unique among admin users
- Role IDs must reference valid existing roles
- Personalization settings must follow the expected schema format

## Entity: Role
**Description**: Defines a set of permissions that can be assigned to admin users

**Fields**:
- `id` (String, Primary Key): Unique identifier for the role
- `name` (String): Name of the role (e.g., "Super Admin", "Content Manager", "User Manager")
- `description` (String): Human-readable description of the role's purpose
- `permissionIds` (String[]): Array of permission IDs that this role includes
- `createdAt` (DateTime): Date and time the role was created
- `updatedAt` (DateTime): Date and time the role was last updated
- `createdBy` (String): ID of the admin user who created this role
- `isActive` (Boolean): Whether the role is active (default: true)

**Validation Rules**:
- Name must be unique
- Permission IDs must reference valid existing permissions
- CreatedBy must reference a valid admin user

## Entity: Permission
**Description**: Defines a specific capability or access level (e.g., read user data, modify settings, etc.)

**Fields**:
- `id` (String, Primary Key): Unique identifier for the permission
- `name` (String): Name of the permission (e.g., "user.read", "user.write", "admin.settings.manage")
- `description` (String): Human-readable description of what this permission allows
- `category` (String): Category of the permission (e.g., "user", "content", "settings", "admin")
- `createdAt` (DateTime): Date and time the permission was created
- `isActive` (Boolean): Whether the permission is active (default: true)

**Validation Rules**:
- Name must be unique
- Category must be one of the allowed values

## Entity: AuditLog
**Description**: Records all administrative actions for security and compliance purposes

**Fields**:
- `id` (String, Primary Key): Unique identifier for the audit log entry
- `userId` (String): ID of the admin user who performed the action
- `action` (String): The action that was performed (e.g., "user.update", "permission.assign")
- `resourceType` (String): Type of resource that was affected (e.g., "user", "role", "permission")
- `resourceId` (String): ID of the specific resource that was affected
- `timestamp` (DateTime): Time when the action was performed
- `ipAddress` (String): IP address of the admin user when the action was performed
- `userAgent` (String, optional): Browser/device information
- `sessionId` (String): Session ID when the action was performed
- `actionOutcome` (String): Outcome of the action ("success", "failed", "error")
- `beforeValue` (Json, optional): JSON representation of the resource before the action
- `afterValue` (Json, optional): JSON representation of the resource after the action
- `metadata` (Json, optional): Additional metadata about the action

**Validation Rules**:
- UserId must reference a valid admin user
- Action must be one of the defined actions
- Timestamp must be in the past or present
- Action outcome must be one of the allowed values

## Entity: ResourceLock
**Description**: Tracks exclusive access to resources to prevent concurrent modifications

**Fields**:
- `id` (String, Primary Key): Unique identifier for the resource lock
- `resourceType` (String): Type of the resource being locked (e.g., "user", "role", "content")
- `resourceId` (String): ID of the specific resource being locked
- `lockedBy` (String): ID of the admin user who acquired the lock
- `lockAcquiredAt` (DateTime): Time when the lock was acquired
- `lockExpiresAt` (DateTime): Time when the lock will automatically expire
- `isActive` (Boolean): Whether the lock is currently active (default: true)

**Validation Rules**:
- Resource type and ID combination must be unique when active
- LockedBy must reference a valid admin user
- LockExpiresAt must be after LockAcquiredAt
- Only one active lock allowed per resource

## Entity: UserPersonalization
**Description**: Stores UI personalization preferences for admin users

**Fields**:
- `id` (String, Primary Key): Unique identifier for the personalization record
- `userId` (String): ID of the admin user who owns these preferences
- `dashboardLayout` (Json): Layout configuration for the user's dashboard
- `themeSettings` (Json): Theme preferences (colors, dark/light mode, etc.)
- `widgetPreferences` (Json): Configuration for custom widgets
- `navigationPreferences` (Json): Navigation menu customizations
- `createdAt` (DateTime): Date and time the preferences were first created
- `updatedAt` (DateTime): Date and time the preferences were last updated

**Validation Rules**:
- UserId must be unique (one personalization record per user)
- UserId must reference a valid admin user
- Dashboard layout and other settings must follow expected schema

## Entity Relationships

### AdminUser Relationships:
- AdminUser → AuditLog (1 to many): One admin user can have many audit log entries
- AdminUser → ResourceLock (1 to many): One admin user can hold many resource locks
- AdminUser → UserPersonalization (1 to 1): One admin user has one personalization record
- AdminUser → Role (many to many via role assignment): Admin users can have multiple roles

### Role Relationships:
- Role → Permission (many to many): Roles can include multiple permissions
- Role → AdminUser (many to many via role assignment): Roles can be assigned to multiple admin users

### Permission Relationships:
- Permission → Role (many to many): Permissions can be part of multiple roles

### ResourceLock Relationships:
- ResourceLock → AdminUser (many to 1): Many locks can be held by one admin user

## Database Constraints

1. **Unique Constraints**:
   - AdminUser.email: Email addresses must be unique among admin users
   - ResourceLock.resourceId + ResourceLock.resourceType: Only one active lock per resource
   - UserPersonalization.userId: Only one personalization record per user

2. **Foreign Key Constraints**:
   - AuditLog.userId → AdminUser.id
   - ResourceLock.lockedBy → AdminUser.id
   - UserPersonalization.userId → AdminUser.id
   - Roles and permissions linked via intermediate tables

3. **Check Constraints**:
   - ResourceLock.lockExpiresAt > ResourceLock.lockAcquiredAt: Lock expiration must be in the future relative to acquisition
   - AdminUser.email matches email format: Email validation
   - AuditLog.actionOutcome is one of allowed values: Valid outcomes only

## Indexing Strategy

1. **Primary Indexes**: Automatically created for primary key fields
2. **Secondary Indexes**:
   - AdminUser.email: For authentication lookups
   - AuditLog.userId: For user-specific audit queries
   - AuditLog.timestamp: For chronological audit queries
   - AuditLog.action: For filtering by action type
   - ResourceLock.resourceId: For resource-based lock queries
   - ResourceLock.resourceType: For lock type queries

---
*Data model created as part of implementation planning for Admin Permissions and UI Optimization feature*