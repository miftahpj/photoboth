<template>
  <div class="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-12 pb-8">
    <div class="w-full max-w-md text-center">

      <div class="section-stamp mb-6 text-airmail-red border-airmail-red">WAKTU HABIS</div>

      <h1 class="font-display text-4xl text-airmail-ink mb-2">TAMBAH WAKTU?</h1>
      <p class="font-courier text-airmail-stamp text-sm mb-8">Tambah 5 menit sesi foto Anda</p>

      <!-- Price display -->
      <div class="paper-card border-2 border-airmail-ink p-6 mb-6">
        <p class="font-courier text-xs text-airmail-stamp tracking-widest mb-2">HARGA EKSTENSI</p>
        <p class="font-display text-4xl text-airmail-red">
          Rp {{ hargaEkstensi ? parseInt(hargaEkstensi).toLocaleString('id-ID') : '—' }}
        </p>
        <p class="font-courier text-xs text-airmail-stamp mt-1">+5 menit · unlimited foto tambahan</p>
      </div>

      <!-- Tab -->
      <div class="flex border-2 border-airmail-ink mb-6">
        <button @click="tab='qris'" :class="tab==='qris'?'bg-airmail-ink text-airmail-cream':'text-airmail-ink'" class="flex-1 font-display py-2 text-xs tracking-widest uppercase transition-colors">📱 QRIS</button>
        <button @click="tab='kode'" :class="tab==='kode'?'bg-airmail-ink text-airmail-cream':'text-airmail-ink'" class="flex-1 font-display py-2 text-xs tracking-widest uppercase border-l-2 border-airmail-ink transition-colors">🎫 KODE</button>
      </div>

      <div v-if="tab === 'qris'" class="paper-card border-2 border-airmail-ink p-6 mb-4">
        <!-- QRIS placeholder -->
        <div class="w-40 h-40 bg-gray-100 mx-auto mb-4 border-2 border-airmail-blue flex items-center justify-center">
          <p class="font-courier text-xs text-airmail-stamp">QRIS PLACEHOLDER</p>
        </div>
        <button @click="handleQrisEkstensi" :disabled="loading" class="btn-primary w-full text-sm">
          {{ loading ? 'Memproses...' : 'PEMBAYARAN SELESAI →' }}
        </button>
      </div>

      <div v-else class="paper-card border-2 border-airmail-ink p-6 mb-4">
        <input
          v-model="kodeInput"
          @keyup.enter="handleKodeEkstensi"
          class="input-airmail text-2xl text-center mb-4 uppercase tracking-[0.5em]"
          placeholder="XXXXXXXX"
          maxlength="8"
          :class="{ 'animate-shake': kodeError }"
        />
        <p v-if="kodeError" class="font-courier text-xs text-airmail-red mb-3">✗ {{ kodeError }}</p>
        <button @click="handleKodeEkstensi" :disabled="loading" class="btn-secondary w-full text-sm">
          {{ loading ? 'Memeriksa...' : 'VALIDASI KODE →' }}
        </button>
      </div>

      <!-- Skip -->
      <button @click="skipToFrame" class="btn-outline w-full text-sm mt-2">
        BATALKAN — LANJUT KE FRAME
      </button>

    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const router  = useRouter()
const session = useSessionStore()
const { getByKey } = usePengaturan()
const { validate, markUsed } = useKodeAkses()
const { create: createTransaksi } = useTransaksi()
const { updateStatus } = useSesi()

const tab        = ref('qris')
const kodeInput  = ref('')
const kodeError  = ref('')
const loading    = ref(false)
const hargaEkstensi = ref(null)

onMounted(async () => {
  if (!session.sesiId) { router.replace('/'); return }
  try { hargaEkstensi.value = await getByKey('harga_ekstensi') } catch {}
})

async function handleQrisEkstensi() {
  loading.value = true
  try {
    await createTransaksi({ id_sesi: session.sesiId, jenis_bayar: 'qris', tujuan: 'ekstensi', jumlah: parseInt(hargaEkstensi.value || '7000') })
    await grantEkstensi()
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function handleKodeEkstensi() {
  kodeError.value = ''
  if (!kodeInput.value.trim()) return
  loading.value = true
  try {
    const kode = await validate(kodeInput.value.trim(), 'ekstensi')
    if (!kode) { kodeError.value = 'Kode tidak valid atau sudah digunakan'; return }
    await markUsed(kode.id)
    await createTransaksi({ id_sesi: session.sesiId, jenis_bayar: 'kode_akses', id_kode: kode.id, tujuan: 'ekstensi' })
    await grantEkstensi()
  } catch (e) { kodeError.value = 'Terjadi kesalahan'; console.error(e) }
  finally { loading.value = false }
}

async function grantEkstensi() {
  await updateStatus(session.sesiId, 'ekstensi')
  session.status = 'ekstensi'
  session.startTimer(300) // +5 minutes
  router.push('/camera')
}

async function skipToFrame() {
  await updateStatus(session.sesiId, 'pilih_frame')
  session.status = 'pilih_frame'
  session.stopTimer()
  router.push('/select-photos')
}
</script>
