import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://jsnbuzjmkckpsoercjmv.supabase.co";

const supabaseKey = "sb_publishable_ed2dCjqdscwkZZTusrpNQQ_uWF5CJ__";

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);