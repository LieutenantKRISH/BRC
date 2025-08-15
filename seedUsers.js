// seedUsers.js
import { createClient } from "@supabase/supabase-js";

// ⚠️ USE SERVICE ROLE KEY (Found in Supabase > Project Settings > API)
const SUPABASE_URL = "https://ucegyhbqttjophuuogqq.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZWd5aGJxdHRqb3BodXVvZ3FxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE2NTYwNywiZXhwIjoyMDcwNzQxNjA3fQ.ZvJYjYtNrgJW_n3SVGP1C53Fi9PTfI2oBtICoCYTVf8"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createUser(email, password) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skips confirmation email
  });

  if (error) {
    console.error(`❌ Failed to create ${email}:`, error.message);
  } else {
    console.log(`✅ Created user: ${email}`);
  }
}

async function main() {
  await createUser("user@example.com", "123456");
  await createUser("manager@example.com", "123456");
  await createUser("admin@example.com", "123456");
  console.log("🎉 Dummy users seeded!");
}

main();
