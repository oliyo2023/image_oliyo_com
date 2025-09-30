@echo off
setlocal

echo Setting up database...

REM Set environment variables
set DATABASE_URL=postgresql://oliyo:gemini4094@localhost:5432/oliyo_image_platform

echo Generating Prisma client...
npx prisma generate

echo Running database migrations...
npx prisma migrate dev --name init

echo Initializing database...
node scripts/init-db.js

echo Creating test user...
node scripts/create-test-user.js

echo Database setup completed!
pause