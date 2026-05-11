const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setup() {
  console.log('--- SYNCING PROFILES (NO UPDATED_AT) ---');

  const users = [
    { email: 'admin@druxx.com', role: 'ADMIN' },
    { email: 'vendor@druxx.com', role: 'VENDOR' },
    { email: 'infopromptix@gmail.com', role: 'ADMIN' }
  ];

  const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }

  for (const u of users) {
    const sUser = authUsers.users.find(user => user.email === u.email);
    if (sUser) {
      console.log('Syncing profile for ' + u.email);
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: sUser.id,
          full_name: u.email.split('@')[0],
          role: u.role
        });
      
      if (profileError) {
        console.error('Error for ' + u.email + ': ' + profileError.message);
      } else {
        console.log('✅ Profile synced for ' + u.email);
      }
    }
  }
}

setup();
