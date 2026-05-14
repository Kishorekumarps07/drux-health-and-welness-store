require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

// Supabase Admin client (can delete auth users)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Emails to KEEP
const KEEP_EMAILS = [
  'test_admin@druxx.com',
  'test_customer@druxx.com',
  'test_vendor@druxx.com',
  'test_vendor2@druxx.com',
];

async function main() {
  // 1. Find all users to delete from Node.js DB
  const toDelete = await prisma.user.findMany({
    where: { email: { notIn: KEEP_EMAILS } },
    select: { id: true, name: true, email: true, roles: true }
  });

  console.log(`\n🗑️  Deleting ${toDelete.length} accounts (keeping ${KEEP_EMAILS.length} test accounts):\n`);
  toDelete.forEach(u => console.log(`  - ${u.email} (${u.name})`));

  // 2. Delete dependent records first (foreign key constraints)
  const emailsToDelete = toDelete.map(u => u.email);
  const userIdsToDelete = toDelete.map(u => u.id);

  console.log('\n🧹 Cleaning up related records...');
  await prisma.payment.deleteMany({ where: { userId: { in: userIdsToDelete } } });
  await prisma.review.deleteMany({ where: { userId: { in: userIdsToDelete } } });
  await prisma.cartItem.deleteMany({ where: { cart: { userId: { in: userIdsToDelete } } } });
  await prisma.cart.deleteMany({ where: { userId: { in: userIdsToDelete } } });
  await prisma.orderItem.deleteMany({ where: { order: { userId: { in: userIdsToDelete } } } });
  await prisma.order.deleteMany({ where: { userId: { in: userIdsToDelete } } });
  await prisma.address.deleteMany({ where: { userId: { in: userIdsToDelete } } });
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIdsToDelete } } });
  console.log('  ✅ Related records cleaned.');

  // 3. Delete users from Prisma DB
  const deleted = await prisma.user.deleteMany({
    where: { email: { notIn: KEEP_EMAILS } }
  });
  console.log(`\n✅ Deleted ${deleted.count} users from database.`);

  // 3. Delete from Supabase Auth
  console.log('\n🔑 Cleaning up Supabase Auth accounts...');
  const { data: { users: authUsers }, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.warn('  ⚠️  Could not list Supabase Auth users:', error.message);
  } else {
    let deletedAuth = 0;
    for (const authUser of authUsers) {
      if (!KEEP_EMAILS.includes(authUser.email)) {
        const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
        if (delErr) {
          console.warn(`  ⚠️  Could not delete Supabase Auth user ${authUser.email}:`, delErr.message);
        } else {
          console.log(`  ✅ Removed from Supabase Auth: ${authUser.email}`);
          deletedAuth++;
        }
      }
    }
    console.log(`\n✅ Removed ${deletedAuth} users from Supabase Auth.`);
  }

  // 4. Show remaining accounts
  const remaining = await prisma.user.findMany({
    select: { name: true, email: true, roles: true }
  });
  console.log('\n📋 Remaining accounts:');
  remaining.forEach(u => console.log(`  - ${u.email} | ${u.roles.join(', ')}`));
  console.log('\nDone! You can now create fresh accounts.\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
