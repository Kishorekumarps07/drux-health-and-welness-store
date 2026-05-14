const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. List all users
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, roles: true, createdAt: true }
  });

  console.log('\n=== ALL USER ACCOUNTS ===\n');
  users.forEach((u, i) => {
    console.log(`${i + 1}. ${u.name}`);
    console.log(`   Email  : ${u.email}`);
    console.log(`   Roles  : ${u.roles.join(', ')}`);
    console.log(`   Created: ${new Date(u.createdAt).toLocaleDateString()}`);
    console.log('');
  });

  // 2. Hash the new password
  const newHash = await bcrypt.hash('password123', 12);

  // 3. Update all users
  const result = await prisma.user.updateMany({
    data: { passwordHash: newHash }
  });

  console.log(`✅ Successfully reset passwords for ${result.count} accounts.`);
  console.log('   New password: password123\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
