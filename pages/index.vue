<template>
  <div class="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-12 pb-8">
    <div v-if="showFlash" class="fixed inset-0 bg-white z-50 flash-overlay pointer-events-none"></div>

    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="font-display text-5xl text-airmail-ink leading-none tracking-widest mb-1">RAFIKOSAN</h1>
        <p class="font-playfair italic text-airmail-stamp text-xl tracking-wider mb-6">lemillion project</p>
      </div>

      <div class="flex border-2 border-airmail-ink mb-0">
        <button
          @click="tab = 'qris'"
          :class="tab === 'qris' ? 'bg-airmail-tan text-airmail-ink' : 'bg-transparent text-airmail-ink hover:bg-airmail-tan/30'"
          class="flex-1 font-display tracking-widest py-3 text-sm uppercase transition-colors"
        >QRIS</button>
        <button
          @click="tab = 'kode'"
          :class="tab === 'kode' ? 'bg-airmail-blue text-white' : 'bg-transparent text-airmail-ink hover:bg-airmail-tan/30'"
          class="flex-1 font-display tracking-widest py-3 text-sm uppercase transition-colors border-l-2 border-airmail-ink"
        >KODE AKSES</button>
      </div>

      <div v-if="tab === 'qris'" class="border-2 border-t-0 border-airmail-ink p-6 bg-airmail-cream">
        <div class="text-center mb-4">
          <div class="inline-block border-4 border-airmail-blue p-1 shadow-stamp mb-3">
            <div class="w-44 h-44 bg-white flex items-center justify-center mx-auto">
              <p class="font-courier text-xs text-airmail-stamp text-center px-2">
                <img src="/assets/dana.jpg" alt="" srcset="">
              </p>
            </div>
          </div>
          <p class="font-display text-3xl text-airmail-red">
            Rp {{ hargaUtama ? parseInt(hargaUtama).toLocaleString('id-ID') : '17.000' }}
          </p>
          <p class="font-courier text-xs text-airmail-stamp mt-1">Durasi sesi 10 menit · 6 foto</p>
        </div>
        <!-- <button @click="handleQrisPay" :disabled="loading" class="btn-primary w-full mt-2 text-sm">
          {{ loading ? 'Memproses...' : 'PEMBAYARAN SELESAI →' }}
        </button> -->
      </div>

      <div v-else class="border-2 border-t-0 border-airmail-ink p-6 bg-airmail-cream">
        <label class="font-display text-xs tracking-[0.3em] text-airmail-stamp uppercase block mb-3">MASUKKAN KODE AKSES</label>
        <input
          v-model="kodeInput"
          @keyup.enter="handleKodeSubmit"
          @input="kodeError = ''"
          class="w-full border-2 border-airmail-ink bg-white font-courier text-2xl text-center py-3 px-4 mb-3 uppercase tracking-[0.5em] focus:outline-none focus:border-airmail-red transition-colors"
          :class="kodeError ? 'border-airmail-red bg-red-50' : ''"
          placeholder="Masukkan kode"
          autocomplete="off"
          spellcheck="false"
        />
        <div v-if="kodeError" class="bg-red-50 border border-red-200 px-3 py-2 mb-3">
          <p class="font-courier text-xs text-red-600">{{ kodeError }}</p>
        </div>
        <button
          @click="handleKodeSubmit"
          :disabled="loading || !kodeInput.trim()"
          class="w-full font-display tracking-widest uppercase py-3 text-sm transition-all duration-150 border-2"
          :class="loading || !kodeInput.trim()
            ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
            : 'bg-airmail-red text-white border-airmail-ink shadow-stamp hover:bg-airmail-ink cursor-pointer'"
        >
          {{ loading ? 'Memeriksa...' : '→ GUNAKAN KODE' }}
        </button>
        <p class="font-courier text-xs text-center text-airmail-tan mt-3">Durasi sesi 10 menit · 6 foto</p>
      </div>

      <p class="text-center mt-6 font-courier text-xs text-airmail-tan">
        <NuxtLink to="/admin/login" class="hover:text-airmail-stamp transition-colors">[admin panel]</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const router  = useRouter()
const session = useSessionStore()
const { getByKey }            = usePengaturan()
const { validate, markUsed }  = useKodeAkses()
const { create: createSesi }  = useSesi()
const { create: createTransaksi } = useTransaksi()

const tab        = ref('qris')
const kodeInput  = ref('')
const kodeError  = ref('')
const loading    = ref(false)
const showFlash  = ref(false)
const hargaUtama = ref(null)

onMounted(async () => {
  try { hargaUtama.value = await getByKey('harga_utama') } catch (e) { console.warn(e) }
})

async function handleQrisPay() {
  loading.value = true
  try {
    const sesi = await createSesi()
    await createTransaksi({ id_sesi: sesi.id, jenis_bayar: 'qris', tujuan: 'utama', jumlah: parseInt(hargaUtama.value || '17000') })
    session.initSesi(sesi.id, sesi.kode_sesi)
    flashAndNavigate('/prep')
  } catch (e) {
    console.error('[QRIS]', e)
    kodeError.value = 'Terjadi kesalahan sistem. Coba lagi.'
  } finally { loading.value = false }
}

async function handleKodeSubmit() {
  kodeError.value = ''
  const raw = kodeInput.value.trim()
  if (!raw) return
  loading.value = true
  try {
    const kode = await validate(raw, 'utama')
    if (!kode) { kodeError.value = 'Kode tidak valid atau sudah digunakan'; return }
    await markUsed(kode.id)
    const sesi = await createSesi()
    await createTransaksi({ id_sesi: sesi.id, jenis_bayar: 'kode_akses', id_kode: kode.id, tujuan: 'utama' })
    session.initSesi(sesi.id, sesi.kode_sesi)
    flashAndNavigate('/prep')
  } catch (e) {
    console.error('[Kode]', e)
    const msg = e?.message || e?.details || JSON.stringify(e)
    kodeError.value = 'Terjadi kesalahan: ' + msg
  } finally { loading.value = false }
}

function flashAndNavigate(path) {
  showFlash.value = true
  setTimeout(() => { showFlash.value = false; router.push(path) }, 350)
}
</script>
