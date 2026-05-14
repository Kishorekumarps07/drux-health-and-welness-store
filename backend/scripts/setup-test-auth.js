require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TEST_ACCOUNTS = [
  { email: 'admin@druxx.com', password: 'password123', name: 'Druxx Admin', role: 'ADMIN' },
  { email: 'vendor@druxx.com', password: 'password123', name: 'Druxx Vendor', role: 'VENDOR' },
  { email: 'test_admin@druxx.com', password: 'password123', name: 'Test Admin', role: 'ADMIN' },
  { email: 'test_vendor@druxx.com', password: 'password123', name: 'Test Vendor', role: 'VENDOR' },
  { email: 'test_vendor2@druxx.com', password: 'password123', name: 'Test Vendor 2', role: 'VENDOR' },
  { email: 'test_customer@druxx.com', password: 'password123', name: 'Test Customer', role: 'CUSTOMER' },
];

async function main() {
  console.log('\n🚀 Setting up unified test accounts (DB + Auth)...\n');
  const passwordHash = await bcrypt.hash('password123', 12);

  for (const acc of TEST_ACCOUNTS) {
    // 1. Setup in Supabase Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = users.find(u => u.email === acc.email);

    let supabaseUserId;
    if (authUser) {
      supabaseUserId = authUser.id;
      await supabaseAdmin.auth.admin.updateUserById(supabaseUserId, { 
        password: acc.password, 
        user_metadata: { full_name: acc.name, role: acc.role } 
      });
      console.log(`  ✅ Auth: Updated ${acc.email}`);
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: { full_name: acc.name, role: acc.role }
      });
      if (createError) {
        console.error(`  ❌ Auth: Failed ${acc.email}:`, createError.message);
        continue;
      }
      supabaseUserId = newUser.user.id;
      console.log(`  ✅ Auth: Created ${acc.email}`);
    }

    // 2. Setup in Node.js DB
    const existingDbUser = await prisma.user.findUnique({ where: { email: acc.email } });
    if (existingDbUser) {
      await prisma.user.update({
        where: { id: existingDbUser.id },
        data: { name: acc.name, roles: [acc.role, 'CUSTOMER'], passwordHash, id: supabaseUserId }
      });
      console.log(`  ✅ DB:   User ${acc.email} updated`);
    } else {
      await prisma.user.create({
        data: { 
          id: supabaseUserId, 
          email: acc.email, 
          name: acc.name, 
          roles: [acc.role, 'CUSTOMER'], 
          passwordHash 
        }
      });
      console.log(`  ✅ DB:   User ${acc.email} created`);
    }

    // 3. Setup Vendor Profile if role is VENDOR
    if (acc.role === 'VENDOR') {
      const existingVendor = await prisma.vendor.findUnique({ where: { userId: supabaseUserId } });
      if (!existingVendor) {
        await prisma.vendor.create({
          data: {
            userId: supabaseUserId,
            storeName: acc.name,
            storeSlug: acc.name.toLowerCase().replace(/\s+/g, '-'),
            approvalStatus: 'ACTIVE'
          }
        });
        console.log(`  ✅ DB:   Vendor profile created for ${acc.email}`);
      } else {
        await prisma.vendor.update({
          where: { userId: supabaseUserId },
          data: { approvalStatus: 'ACTIVE' }
        });
        console.log(`  ✅ DB:   Vendor profile updated for ${acc.email}`);
      }
    }
  }

  console.log('\n🎉 System fully synchronized. You can log in with password123\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
