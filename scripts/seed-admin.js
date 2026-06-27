const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Try to load environment variables from .env or .env.local
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    });
  }
} catch (e) {
  console.log('Skipped loading .env.local:', e.message);
}

// Supabase URL & Service Role Key (loaded from .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const USERS_TO_SEED = [
  {
    username: 'superadmin',
    email: 'superadmin@sekolah-istiqamah.sch.id',
    password: 'adminpassword123',
    role: 'super_admin'
  },
  {
    username: 'admin',
    email: 'admin@sekolah-istiqamah.sch.id',
    password: 'adminpassword123',
    role: 'admin'
  },
  {
    username: 'guru',
    email: 'guru@sekolah-istiqamah.sch.id',
    password: 'gurupassword123',
    role: 'guru'
  },
  {
    username: 'orangtua',
    email: 'orangtua@sekolah-istiqamah.sch.id',
    password: 'parentpassword123',
    role: 'orang_tua'
  }
];

async function seed() {
  console.log('Starting seed process...');
  console.log('Supabase URL:', supabaseUrl);

  for (const user of USERS_TO_SEED) {
    console.log(`\nProcessing user: ${user.username} (${user.role})`);

    // Check if user already exists in public.users_tk
    const { data: existingUser, error: findError } = await supabase
      .from('users_tk')
      .select('*')
      .eq('username', user.username)
      .maybeSingle();

    if (findError) {
      console.error(`Error checking user ${user.username}:`, findError.message);
      continue;
    }

    if (existingUser) {
      console.log(`User ${user.username} already exists in public.users_tk. Skipping creation.`);
      continue;
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(user.password, 10);

    // Create user in auth schema
    console.log(`Creating auth user for ${user.email}...`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        role: user.role,
        username: user.username
      }
    });

    if (authError) {
      // If it exists in auth but not in users_tk, link them
      if (authError.message.includes('already registered') || authError.message.includes('email_exists')) {
        console.log(`Auth user for ${user.email} already exists. Attempting to retrieve or link...`);
        
        const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error('Error listing auth users:', listError.message);
          continue;
        }
        
        const existingAuthUser = userList.users.find(u => u.email === user.email);
        if (existingAuthUser) {
          console.log(`Found auth user. Inserting into public.users_tk...`);
          const { error: insertError } = await supabase
            .from('users_tk')
            .insert({
              id: existingAuthUser.id,
              username: user.username,
              email: user.email,
              password_hash: passwordHash,
              role: user.role,
              status: 'active'
            });
          if (insertError) {
            console.error(`Error inserting into public.users_tk:`, insertError.message);
          } else {
            console.log(`Successfully linked and inserted user ${user.username}.`);
          }
        } else {
          console.error(`Could not find auth user for ${user.email} in the list.`);
        }
      } else {
        console.error(`Error creating auth user for ${user.username}:`, authError.message);
      }
      continue;
    }

    const authId = authData.user.id;
    console.log(`Created auth user with ID: ${authId}`);

    // Insert into public.users_tk
    console.log(`Inserting into public.users_tk...`);
    const { error: insertError } = await supabase
      .from('users_tk')
      .insert({
        id: authId,
        username: user.username,
        email: user.email,
        password_hash: passwordHash,
        role: user.role,
        status: 'active'
      });

    if (insertError) {
      console.error(`Error inserting user ${user.username} into public.users_tk:`, insertError.message);
    } else {
      console.log(`Successfully seeded user ${user.username}!`);
    }
  }

  console.log('\nSeed process finished.');
}

seed();
