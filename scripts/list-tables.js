const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listTables() {
  try {
    console.log('Listing all tables in the database...');
    
    // Query to list all tables in the current schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log('Tables in the database:');
    if (tables.length === 0) {
      console.log('No tables found');
    } else {
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    // Also check the current database and schema
    const dbInfo = await prisma.$queryRaw`
      SELECT current_database() as database, current_schema() as schema
    `;
    
    console.log('\nDatabase info:');
    console.log(`Database: ${dbInfo[0].database}`);
    console.log(`Schema: ${dbInfo[0].schema}`);
    
  } catch (error) {
    console.error('Error listing tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listTables();