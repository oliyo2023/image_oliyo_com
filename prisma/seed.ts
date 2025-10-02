import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAIModels() {
  console.log('Seeding AI models...');

  // Define the initial AI models based on the specification
  const aiModels = [
    {
      name: 'qwen-image-edit',
      costPerUse: 5, // As specified in the requirements
      isActive: true,
      usageCount: 0,
    },
    {
      name: 'gemini-flash-image',
      costPerUse: 10, // As specified in the requirements
      isActive: true,
      usageCount: 0,
    },
    // Add any additional AI models as needed
  ];

  for (const model of aiModels) {
    const existingModel = await prisma.aIModel.findUnique({
      where: { name: model.name }
    });

    if (existingModel) {
      console.log(`AI model ${model.name} already exists, updating...`);
      await prisma.aIModel.update({
        where: { name: model.name },
        data: {
          costPerUse: model.costPerUse,
          isActive: model.isActive
        }
      });
    } else {
      console.log(`Creating AI model ${model.name}...`);
      await prisma.aIModel.create({
        data: model
      });
    }
  }

  console.log('AI model seeding complete!');
}

async function seedAdminUser() {
  console.log('Seeding admin user...');

  const adminEmail = 'admin@oliyo.com';
  
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  // Create admin user with elevated privileges
  // Note: In a real application, you'd want to securely hash the password
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: '$2a$12$0Ohq7o0h5Cq4B6YJvN8T.eQ5HbGc9vQ4zq3q0r2o5n3o5n3o5n3o5', // This should be a properly hashed password
      creditBalance: 10000, // Large balance for admin testing
      registrationDate: new Date(),
      lastLogin: null,
      socialLoginProvider: null,
      isActive: true,
      role: 'admin' // Assuming there's a role field in the schema
    }
  });

  console.log('Admin user created successfully!');
}

async function main() {
  try {
    await seedAIModels();
    await seedAdminUser();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}