// scripts/init-db.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Connect to the database
    await prisma.$connect();
    console.log('✅ Connected to the database');
    
    // Create sample AI models
    console.log('Creating sample AI models...');
    
    const aiModels = [
      {
        name: 'qwen-image-edit',
        costPerUse: 5.0,
        isActive: true
      },
      {
        name: 'gemini-flash-image',
        costPerUse: 3.0,
        isActive: true
      }
    ];
    
    for (const modelData of aiModels) {
      try {
        const existingModel = await prisma.aIModel.findUnique({
          where: { name: modelData.name }
        });
        
        if (!existingModel) {
          await prisma.aIModel.create({
            data: modelData
          });
          console.log(`✅ Created AI model: ${modelData.name}`);
        } else {
          console.log(`ℹ️ AI model already exists: ${modelData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating AI model ${modelData.name}:`, error.message);
      }
    }
    
    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization if this script is called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };