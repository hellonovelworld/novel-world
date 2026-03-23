import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://buwspafsblpljycnsenf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1d3NwYWZzYmxwbGp5Y25zZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5ODE5MTYsImV4cCI6MjA4OTU1NzkxNn0.R91DmGWw_q9uPYU8YVXV1-71MXZebaRJnWgmj5BU--E";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);