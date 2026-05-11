const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uflcqzbqmnmmycvpzjud.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedAuth() {
  console.log('--- SEEDING SUPABASE AUTH ---');

  const users = [
    { email: 'admin@druxx.com', password: 'password123', role: 'ADMIN' },
    { email: 'vendor@druxx.com', password: 'password123', role: 'VENDOR' },
    { email: 'infopromptix@gmail.com', password: 'password123', role: 'ADMIN' }
  ];

  for (const u of users) {
    console.log(`Creating/Updating user: ${u.email}`);
    
    // Check if user exists
    const { data: listUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError);
      continue;
    }

    const existingUser = listUsers.users.find(user => user.email === u.email);

    if (existingUser) {
      console.log(`User ${u.email} already exists. Updating password...`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: u.password,
        user_metadata: { role: u.role, full_name: u.email.split('@')[0] }
      });
      if (updateError) console.error(`Error updating ${u.email}:`, updateError);
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { role: u.role, full_name: u.email.split('@')[0] }
      });
      if (createError) {
        console.error(`Error creating ${u.email}:`, createError);
      } else {
        console.log(`✅ User ${u.email} created in Auth!`);
      }
    }
  }

  console.log('--- AUTH SEEDING COMPLETE ---');
}

seedAuth();
