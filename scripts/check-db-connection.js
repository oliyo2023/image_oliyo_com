// scripts/check-db-connection.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    console.log('Checking database connection...');
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Try a simple query
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✅ Database query successful');
    
    // Check if tables exist by trying to query them
    console.log('Checking if required tables exist...');
    
    try {
      await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
      console.log('✅ User table exists');
    } catch (error) {
      console.log('⚠️ User table does not exist yet');
    }
    
    try {
      await prisma.$queryRaw`SELECT 1 FROM "CreditTransaction" LIMIT 1`;
      console.log('✅ CreditTransaction table exists');
    } catch (error) {
      console.log('⚠️ CreditTransaction table does not exist yet');
    }
    
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Image" LIMIT 1`;
      console.log('✅ Image table exists');
    } catch (error) {
      console.log('⚠️ Image table does not exist yet');
    }
    
    try {
      await prisma.$queryRaw`SELECT 1 FROM "AIModel" LIMIT 1`;
      console.log('✅ AIModel table exists');
    } catch (error) {
      console.log('⚠️ AIModel table does not exist yet');
    }
    
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Article" LIMIT 1`;
      console.log('✅ Article table exists');
    } catch (error) {
      console.log('⚠️ Article table does not exist yet');
    }
    
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Session" LIMIT 1`;
      console.log('✅ Session table exists');
    } catch (error) {
      console.log('⚠️ Session table does not exist yet');
    }
    
    console.log('Database connection check completed');
    
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check if this script is called directly
if (require.main === module) {
  checkDatabaseConnection();
}

module.exports = { checkDatabaseConnection };