import { createClient } from '@supabase/supabase-js';

const supabaseUrl = undefined                            ;
const supabaseKey = undefined                                 ;
{
  throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase as s };
