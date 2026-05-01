const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function verifyLogin() {
  const email = 'test_admin@druxx.com';
  const password = 'Admin@123';
  
  console.log(`--- Authentication Verification for ${email} ---`);
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`ERORR: User not found.`);
      process.exit(1);
    }
    
    console.log(`Checking password...`);
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (isMatch) {
       console.log(`SUCCESS: Backend correctly accepts the new credentials.`);
    } else {
       console.error(`FAILURE: Password mismatch! Verification failed.`);
       process.exit(1);
    }
    
    console.log(`--- Verification Complete ---`);
  } catch (error) {
    console.error('ERROR during verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyLogin();
