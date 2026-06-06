<template>
  <div class="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-12 pb-8">
    <div class="w-full max-w-lg text-center">

      <!-- Envelope illustration -->
      <div class="relative inline-block mb-8">
        <div class="w-32 h-24 mx-auto relative">
          <div class="absolute inset-0 border-4 border-airmail-ink bg-airmail-cream shadow-frame">
            <div class="absolute inset-0" style="background: linear-gradient(135deg, transparent 50%, #F5EDD6 50%), linear-gradient(225deg, transparent 50%, #F5EDD6 50%); background-size: 100% 100%;"></div>
            <!-- Airmail stripes on envelope -->
            <div class="absolute bottom-0 left-0 right-0 h-3" style="background: repeating-linear-gradient(90deg, #C0392B 0px, #C0392B 6px, #fff 6px, #fff 12px, #1A3A6B 12px, #1A3A6B 18px);"></div>
          </div>
          <!-- Stamp corner -->
          <div class="absolute top-1 right-1 w-8 h-10 border-2 border-airmail-stamp bg-airmail-tan/50 flex items-center justify-center">
            <span class="text-xs">📷</span>
          </div>
        </div>
      </div>

      <div class="section-stamp mb-4">SIAP MEMULAI</div>

      <h1 class="font-display text-5xl text-airmail-ink mb-4 leading-tight">
        SESI PHOTO<br>
        <span class="text-airmail-red">ANDA SIAP!</span>
      </h1>

      <div class="paper-card border-2 border-airmail-ink p-6 mb-8 text-left space-y-3">
        <div class="flex items-start gap-3">
          <span class="text-2xl">⏱️</span>
          <div>
            <p class="font-display text-sm tracking-widest text-airmail-ink uppercase">Durasi Sesi</p>
            <p class="font-courier text-airmail-stamp text-sm">10 menit untuk mengambil foto sebanyak-banyaknya</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="text-2xl">📸</span>
          <div>
            <p class="font-display text-sm tracking-widest text-airmail-ink uppercase">Jumlah Foto</p>
            <p class="font-courier text-airmail-stamp text-sm">Ambil minimal 6 foto — pilih yang terbaik setelahnya</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="text-2xl">🖼️</span>
          <div>
            <p class="font-display text-sm tracking-widest text-airmail-ink uppercase">Pilih Frame</p>
            <p class="font-courier text-airmail-stamp text-sm">Tata foto di frame vintage airmail pilihan Anda</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="text-2xl">🖨️</span>
          <div>
            <p class="font-display text-sm tracking-widest text-airmail-ink uppercase">Cetak & Simpan</p>
            <p class="font-courier text-airmail-stamp text-sm">Cetak kenangan atau scan QR untuk menyimpan digital</p>
          </div>
        </div>
      </div>

      <!-- Session ID badge -->
      <div class="inline-block border border-airmail-tan px-4 py-2 mb-6">
        <p class="font-courier text-xs text-airmail-tan tracking-[0.3em] uppercase">Session ID</p>
        <p class="font-courier text-airmail-stamp text-sm tracking-widest">{{ kodeSesiShort }}</p>
      </div>

      <div class="flex flex-col gap-3">
        <button @click="startSession" class="btn-primary text-xl py-4 tracking-[0.3em]">
          📸 MULAI PHOTO
        </button>
        <NuxtLink to="/" class="font-courier text-xs text-airmail-tan hover:text-airmail-stamp text-center tracking-widest uppercase">
          ← Kembali ke beranda
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const router  = useRouter()
const session = useSessionStore()
const { mulai } = useSesi()

// Guard: must have active session
onMounted(() => {
  if (!session.sesiId) router.replace('/')
})

const kodeSesiShort = computed(() =>
  session.kodeSesi ? session.kodeSesi.slice(0, 8).toUpperCase() : '—'
)

async function startSession() {
  try {
    await mulai(session.sesiId)
    session.startTimer(600)
    router.push('/camera')
  } catch (e) {
    console.error(e)
  }
}
</script>
