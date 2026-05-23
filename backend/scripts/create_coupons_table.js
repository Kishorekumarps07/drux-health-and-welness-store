const prisma = require('../src/lib/prisma');

async function createTable() {
  console.log('--- CREATING COUPONS TABLE ---');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_percent INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Coupons table verified/created successfully.');
  } catch (error) {
    console.error('Failed to create coupons table:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTable();
