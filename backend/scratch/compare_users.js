const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log("=== SUPABASE AUTH USERS ===");
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  if (authError) {
    console.error("Failed to list auth users:", authError);
    return;
  }
  
  const authMap = new Map();
  users.forEach(u => {
    authMap.set(u.id, u);
    console.log(`ID: ${u.id} | Email: ${u.email} | Role Metadata: ${u.user_metadata?.role} | Name: ${u.user_metadata?.full_name}`);
  });

  console.log("\n=== POSTGRES USERS & VENDORS ===");
  const dbUsers = await prisma.user.findMany({
    include: { vendor: true }
  });
  
  dbUsers.forEach(u => {
    const authUser = authMap.get(u.id);
    console.log(`Email: ${u.email}`);
    console.log(`  ID in DB: ${u.id}`);
    console.log(`  Roles in DB: ${JSON.stringify(u.roles)}`);
    console.log(`  Vendor Profile: ${u.vendor ? `${u.vendor.storeName} (Status: ${u.vendor.approvalStatus})` : 'None'}`);
    console.log(`  In Supabase Auth: ${authUser ? 'Yes' : 'No'}`);
    if (authUser) {
      console.log(`  Auth Email Match: ${authUser.email === u.email ? 'Yes' : 'No'}`);
    }
    console.log('-----------------------------------');
  });
}

run().catch(console.error).finally(() => prisma.$disconnect());
