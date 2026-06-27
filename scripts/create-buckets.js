const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
    if (match) {
      let val = (match[2] || '').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[match[1]] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const buckets = ['ppdb-documents', 'payment-proof', 'bucket_tk'];
  for (const bucket of buckets) {
    console.log(`Ensuring bucket: ${bucket}`);
    const { data, error } = await supabase.storage.createBucket(bucket, {
      public: true
    });
    if (error) {
      console.log(`Bucket ${bucket} result: ${error.message}`);
    } else {
      console.log(`Bucket ${bucket} created successfully.`);
    }
  }
}

main();
