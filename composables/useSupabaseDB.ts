// composables/useSupabaseDB.ts

// ─── Pengaturan ───────────────────────────────────────────────
export const usePengaturan = () => {
  const db = useSupabaseClient()

  const getAll = async () => {
    const { data, error } = await db.from('pengaturan').select('*')
    if (error) throw error
    return data
  }

  const getByKey = async (key: string) => {
    const { data, error } = await db
      .from('pengaturan')
      .select('nilai')
      .eq('kunci_pengaturan', key)
      .single()
    if (error) throw error
    return data?.nilai as string
  }

  const update = async (key: string, value: string) => {
    const { error } = await db
      .from('pengaturan')
      .update({ nilai: value, updated_at: new Date().toISOString() })
      .eq('kunci_pengaturan', key)
    if (error) throw error
  }

  return { getAll, getByKey, update }
}

// ─── Kode Akses ───────────────────────────────────────────────
export const useKodeAkses = () => {
  const db = useSupabaseClient()

  const validate = async (kode: string, jenis: 'utama' | 'ekstensi') => {
    const trimmed = kode.trim().toUpperCase()
    if (!trimmed) return null
    const { data, error } = await db
      .from('kode_akses')
      .select('*')
      .eq('kode', trimmed)
      .eq('jenis_kode', jenis)
      .eq('is_aktif', true)
      .eq('is_digunakan', false)
      .maybeSingle()
    if (error) { console.error('[validate]', error); throw error }
    return data
  }

  const markUsed = async (id: number) => {
    const { error } = await db
      .from('kode_akses')
      .update({ is_digunakan: true, used_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  }

  const getAll = async () => {
    const { data, error } = await db
      .from('kode_akses')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  const generate = async (jenis: 'utama' | 'ekstensi', jumlah: number) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const codes = Array.from({ length: jumlah }, () =>
      Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    )
    const rows = codes.map(kode => ({ kode, jenis_kode: jenis }))
    const { data, error } = await db.from('kode_akses').insert(rows).select()
    if (error) throw error
    return data
  }

  const toggleAktif = async (id: number, is_aktif: boolean) => {
    const { error } = await db.from('kode_akses').update({ is_aktif }).eq('id', id)
    if (error) throw error
  }

  return { validate, markUsed, getAll, generate, toggleAktif }
}

// ─── Sesi ─────────────────────────────────────────────────────
export const useSesi = () => {
  const db = useSupabaseClient()

  const create = async () => {
    const { data, error } = await db
      .from('sesi')
      .insert({ status: 'aktif' })
      .select()
      .single()
    if (error) throw error
    return data
  }

  const mulai = async (id: number) => {
    const { error } = await db
      .from('sesi')
      .update({ waktu_mulai: new Date().toISOString(), status: 'aktif' })
      .eq('id', id)
    if (error) throw error
  }

  const updateStatus = async (id: number, status: string) => {
    const { error } = await db.from('sesi').update({ status }).eq('id', id)
    if (error) throw error
  }

  const selesai = async (id: number) => {
    const { error } = await db
      .from('sesi')
      .update({ status: 'selesai', waktu_selesai: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  }

  const getByKode = async (kode: string) => {
    const { data, error } = await db
      .from('sesi')
      .select(`
        *,
        foto (*),
        hasil_frame (
          *,
          master_frame (*),
          foto_terpilih (
            *,
            foto (*)
          )
        )
      `)
      .eq('kode_sesi', kode)
      .single()
    if (error) throw error
    return data
  }

  const getAll = async (date?: string) => {
    let query = db
      .from('sesi')
      .select('*, transaksi(*), foto(*)')
      .order('created_at', { ascending: false })
    if (date) {
      query = query
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lte('created_at', `${date}T23:59:59.999Z`)
    }
    const { data, error } = await query
    if (error) throw error
    return data
  }

  return { create, mulai, updateStatus, selesai, getByKode, getAll }
}

// ─── Foto ─────────────────────────────────────────────────────
export const useFoto = () => {
  const db = useSupabaseClient()

  const upload = async (idSesi: number, blob: Blob, filename: string) => {
    const path = `sesi-${idSesi}/${filename}`
    const { error: upError } = await db.storage
      .from('photos')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
    if (upError) throw upError
    const { data: urlData } = db.storage.from('photos').getPublicUrl(path)
    const { data, error } = await db
      .from('foto')
      .insert({ id_sesi: idSesi, path_file: urlData.publicUrl })
      .select()
      .single()
    if (error) throw error
    return data
  }

  const getBySesi = async (idSesi: number) => {
    const { data, error } = await db
      .from('foto')
      .select('*')
      .eq('id_sesi', idSesi)
      .order('waktu_jepret', { ascending: true })
    if (error) throw error
    return data
  }

  return { upload, getBySesi }
}

// ─── Transaksi ────────────────────────────────────────────────
export const useTransaksi = () => {
  const db = useSupabaseClient()

  const create = async (payload: {
    id_sesi: number
    jenis_bayar: 'qris' | 'kode_akses'
    id_kode?: number | null
    tujuan: 'utama' | 'ekstensi'
    jumlah?: number
  }) => {
    const { data, error } = await db
      .from('transaksi')
      .insert({ ...payload, status_bayar: 'sukses' })
      .select()
      .single()
    if (error) throw error
    return data
  }

  return { create }
}

// ─── Master Frame ─────────────────────────────────────────────
export const useMasterFrame = () => {
  const db = useSupabaseClient()

  const getAll = async () => {
    const { data, error } = await db
      .from('master_frame')
      .select('*')
      .eq('is_aktif', true)
    if (error) throw error
    return data
  }

  return { getAll }
}

// ─── Hasil Frame ──────────────────────────────────────────────
export const useHasilFrame = () => {
  const db = useSupabaseClient()

  const create = async (idSesi: number, idFrame: number) => {
    const { data, error } = await db
      .from('hasil_frame')
      .insert({ id_sesi: idSesi, id_frame: idFrame })
      .select()
      .single()
    if (error) throw error
    return data
  }

  const savePosisi = async (
    idHasil: number,
    posisi: { id_foto: number; urutan_posisi: number }[]
  ) => {
    const rows = posisi.map(p => ({ id_hasil_frame: idHasil, ...p }))
    const { error } = await db.from('foto_terpilih').insert(rows)
    if (error) throw error
  }

  const updatePathHasil = async (id: number, path_hasil: string) => {
    const { error } = await db.from('hasil_frame').update({ path_hasil }).eq('id', id)
    if (error) throw error
  }

  return { create, savePosisi, updatePathHasil }
}
