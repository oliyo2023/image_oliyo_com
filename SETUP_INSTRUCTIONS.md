// SETUP_INSTRUCTIONS.md

# Database Setup Instructions

## Prerequisites
1. Make sure PostgreSQL is installed and running
2. Create a database named `oliyo_image_platform`
3. Ensure the database user `oliyo` with password `gemini4094` exists and has access to the database

## Steps to Set Up the Database

1. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

2. Create and apply the initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```

3. Seed the database with initial data (optional):
   ```bash
   npx prisma db seed
   ```

## What This Does

- Creates all required tables based on the Prisma schema:
  - User
  - CreditTransaction
  - Image
  - AIModel
  - Article
  - Session
  
- Sets up foreign key relationships between tables
- Creates indexes for better query performance

## Troubleshooting

If you get connection errors:
1. Verify PostgreSQL is running
2. Check that the DATABASE_URL in .env.local is correct
3. Ensure the database user has proper permissions

If you get migration errors:
1. Make sure no previous migrations exist
2. Check that the database is empty or drop existing tables