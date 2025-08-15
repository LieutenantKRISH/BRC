import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ucegyhbqttjophuuogqq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZWd5aGJxdHRqb3BodXVvZ3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjU2MDcsImV4cCI6MjA3MDc0MTYwN30.MKlC67OzFRs9X_vat0E0ZegYDEeTXWlglcNO6fY8CNM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
