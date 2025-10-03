// scripts/create-test-user.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Connect to the database
    await prisma.$connect();
    console.log('✅ Connected to the database');
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: '1034640452@qq.com' }
    });
    
    if (existingUser) {
      console.log('ℹ️ Test user already exists');
      console.log(`User ID: ${existingUser.id}`);
      console.log(`Email: ${existingUser.email}`);
      console.log(`Credit Balance: ${existingUser.creditBalance}`);
      return;
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('gemini4094', saltRounds);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: '1034640452@qq.com',
        passwordHash: passwordHash,
        creditBalance: 100,
        registrationDate: new Date(),
        isActive: true,
        role: 'admin'
      }
    });
    
    console.log('✅ Test user created successfully');
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Credit Balance: ${user.creditBalance}`);
    
    // Create initial credit transaction
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        transactionType: 'earned',
        amount: 100,
        date: new Date(),
        description: 'Registration bonus'
      }
    });
    
    console.log('✅ Initial credit transaction created');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function if this script is called directly
if (require.main === module) {
  createTestUser();
}

module.exports = { createTestUser };