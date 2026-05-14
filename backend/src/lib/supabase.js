const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://uflcqzbqmnmmycvpzjud.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials missing in backend .env. Auth bridge might fail.');
}

let supabase = null;

const isValidUrl = (url) => {
  try {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  } catch (e) {
    return false;
  }
};

if (isValidUrl(supabaseUrl) && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  // Provide a mock object with auth.getUser to prevent crashes in middleware
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error('Supabase credentials missing') })
    }
  };
}

module.exports = supabase;
