const prisma = require('../src/lib/prisma');

async function createTable() {
  console.log('--- CREATING NOTIFICATIONS TABLE ---');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'order',
        read BOOLEAN NOT NULL DEFAULT FALSE,
        link TEXT,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
    `);
    
    console.log('✅ Notifications table verified/created successfully.');
  } catch (error) {
    console.error('Failed to create notifications table:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTable();
