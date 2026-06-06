import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username dan password wajib diisi' })
  }

  const config = useRuntimeConfig()
  const serviceKey = config.supabaseServiceKey as string
  const url        = config.public.supabaseUrl as string

  if (!serviceKey || !url) {
    console.error('[login] Missing SUPABASE_SERVICE_KEY or SUPABASE_URL')
    throw createError({ statusCode: 500, statusMessage: 'Konfigurasi server tidak lengkap' })
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: admin, error: dbError } = await supabase
    .from('admin')
    .select('id, username, password_hash, nama_lengkap')
    .eq('username', username.trim().toLowerCase())
    .maybeSingle()

  if (dbError) {
    console.error('[login] DB error:', dbError)
    throw createError({ statusCode: 500, statusMessage: 'Database error: ' + dbError.message })
  }

  if (!admin) {
    throw createError({ statusCode: 401, statusMessage: 'Username atau password salah' })
  }

  const hash = admin.password_hash || ''
  let valid = false

  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    valid = await bcrypt.compare(password, hash)
  } else {
    // plain text fallback (dev only)
    valid = password === hash
  }

  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Username atau password salah' })
  }

  const token = Buffer.from(
    JSON.stringify({ id: admin.id, username: admin.username, ts: Date.now() })
  ).toString('base64')

  return { token, nama: admin.nama_lengkap }
})
