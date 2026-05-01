const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetAdmin() {
  const email = 'test_admin@druxx.com';
  const newPassword = 'Admin@123';
  
  console.log(`--- Administrative Recovery Initiated for ${email} ---`);
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`ERORR: User ${email} not found in database.`);
      process.exit(1);
    }
    
    console.log(`Hashing new password...`);
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    console.log(`Updating database...`);
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    
    console.log(`SUCCESS: Password for ${email} has been reset to: ${newPassword}`);
    console.log(`--- Recovery Process Complete ---`);
  } catch (error) {
    console.error('CRITICAL ERROR during recovery:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
