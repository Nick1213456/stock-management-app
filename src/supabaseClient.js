
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jxorhxagdxrmjyxfobqt.supabase.co'
const supabaseKey = 'sb_publishable_2rKWWcUqjxdHH-k87B_kQQ_VDD-2yFY'

export const supabase = createClient(supabaseUrl, supabaseKey)
