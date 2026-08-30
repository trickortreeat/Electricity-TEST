import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xqsvpaoajrarqztefgiq.supabase.co'
const supabaseAnonKey = 'sb_publishable_bxQpu6oiBW_nQUvttH-dTw_ogmLyCJf'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
