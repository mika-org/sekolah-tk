const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load .env.local
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?s*$/);
      if (match) {
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[match[1]] = val;
      }
    });
  }
} catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function check() {
  console.log('--- Checking public.users_tk ---');
  const { data: users, error: usersError } = await supabase
    .from('users_tk')
    .select('*');

  if (usersError) {
    console.error('Error fetching public.users_tk:', usersError);
  } else {
    console.log(`Found ${users.length} users in public.users_tk:`);
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Username: ${u.username}, Email: ${u.email}, Role: ${u.role}, Status: ${u.status}`);
    });
  }

  console.log('\n--- Checking auth.users ---');
  const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
  if (authUsersError) {
    console.error('Error listing auth users:', authUsersError);
  } else {
    console.log(`Found ${authUsers.users.length} users in auth.users:`);
    authUsers.users.forEach(u => {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Confirmed: ${!!u.email_confirmed_at}, CreatedAt: ${u.created_at}`);
    });
  }
}

check();
