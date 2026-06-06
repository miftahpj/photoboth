<template>
  <div class="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4 py-8 pb-12">

    <div v-if="idleWarning" class="fixed inset-0 bg-airmail-ink/80 flex items-center justify-center z-50 p-4">
      <div class="paper-card border-4 border-airmail-red p-8 max-w-sm w-full text-center">
        <p class="font-display text-3xl text-airmail-red mb-2 animate-pulse">SESI BERAKHIR</p>
        <p class="font-courier text-airmail-ink text-sm mb-4">
          Sesi akan direset dalam <strong>{{ idleCountdown }}</strong> detik
        </p>
        <button @click="cancelIdle" class="btn-primary w-full">SAYA MASIH DI SINI</button>
      </div>
    </div>

    <div class="w-full max-w-md text-center">

      <div class="inline-block border-4 border-green-700 rounded-sm px-6 py-3 mb-6 rotate-[-3deg] shadow-stamp animate-stamp-in">
        <p class="font-display text-green-700 text-2xl tracking-[0.3em]">SELESAI!</p>
        <p class="font-courier text-green-600 text-xs tracking-widest">SESSION COMPLETE</p>
      </div>

      <h1 class="font-display text-4xl text-airmail-ink mb-2">FOTO ANDA SIAP!</h1>
      <p class="font-courier text-airmail-stamp text-sm mb-6">Scan QR untuk melihat & mengunduh foto Anda</p>

      <div class="paper-card border-4 border-airmail-ink p-6 mb-6 inline-block w-full">
        <div class="h-2 -mx-6 -mt-6 mb-4" style="background:repeating-linear-gradient(90deg,#C0392B 0,#C0392B 8px,#fff 8px,#fff 16px,#1A3A6B 16px,#1A3A6B 24px)"></div>
        <p class="font-courier text-xs text-airmail-stamp tracking-widest uppercase mb-3">SCAN UNTUK AKSES FOTO</p>
        <div class="flex justify-center mb-3">
          <canvas ref="qrCanvas" class="border-2 border-airmail-ink p-1 bg-white"></canvas>
        </div>
        <p class="font-courier text-xs text-airmail-stamp mb-1">SESSION ID</p>
        <p class="font-display text-sm text-airmail-ink tracking-[0.3em]">{{ session.kodeSesi?.slice(0,8).toUpperCase() }}</p>
        <div class="h-2 -mx-6 mt-4" style="background:repeating-linear-gradient(90deg,#1A3A6B 0,#1A3A6B 8px,#fff 8px,#fff 16px,#C0392B 16px,#C0392B 24px)"></div>
      </div>

      <div class="flex items-center gap-2 border border-airmail-tan px-3 py-2 mb-6 max-w-xs mx-auto">
        <p class="font-courier text-xs text-airmail-stamp flex-1 truncate">{{ shareLink }}</p>
        <button @click="copyLink" class="text-airmail-ink hover:text-airmail-red transition-colors text-xs font-courier uppercase whitespace-nowrap">
          {{ copied ? '✓ SALIN' : 'SALIN' }}
        </button>
      </div>

      <div class="flex flex-col gap-3">
        <NuxtLink
          :to="'/view/' + session.kodeSesi"
          class="btn-primary text-sm tracking-[0.2em] text-center"
        >
          🖼️ LIHAT HASIL PHOTO
        </NuxtLink>
        <button @click="endSession" class="btn-outline text-sm">
          AKHIRI SESI PHOTO
        </button>
      </div>

      <p class="font-courier text-xs text-airmail-tan mt-6">
        Sesi otomatis berakhir dalam {{ autoResetLabel }}
      </p>
    </div>
  </div>
</template>

<script setup>
import QRCode from 'qrcode'

definePageMeta({ layout: 'default' })

const router  = useRouter()
const session = useSessionStore()
const { selesai } = useSesi()

const qrCanvas      = ref(null)
const copied        = ref(false)
const idleWarning   = ref(false)
const idleCountdown = ref(30)
const autoResetSecs = ref(600)

let autoResetInt = null
let idleTick     = null

const shareLink = computed(() =>
  process.client ? window.location.origin + '/view/' + session.kodeSesi : ''
)
const autoResetLabel = computed(() => {
  const m = Math.floor(autoResetSecs.value / 60)
  const s = autoResetSecs.value % 60
  return m + ':' + String(s).padStart(2, '0')
})

onMounted(async () => {
  if (!session.sesiId) { router.replace('/'); return }
  await nextTick()
  if (qrCanvas.value && session.kodeSesi) {
    await QRCode.toCanvas(qrCanvas.value, shareLink.value, {
      width: 180, margin: 1,
      color: { dark: '#2C1A0E', light: '#FFFFFF' },
    })
  }
  autoResetInt = setInterval(() => {
    autoResetSecs.value--
    if (autoResetSecs.value <= 30 && !idleWarning.value) startIdleWarning()
    if (autoResetSecs.value <= 0) endSession()
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(autoResetInt)
  clearInterval(idleTick)
})

function startIdleWarning() {
  idleWarning.value   = true
  idleCountdown.value = 30
  idleTick = setInterval(() => {
    idleCountdown.value--
    if (idleCountdown.value <= 0) endSession()
  }, 1000)
}

function cancelIdle() {
  idleWarning.value = false
  clearInterval(idleTick)
  autoResetSecs.value = 600
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}

async function endSession() {
  clearInterval(autoResetInt)
  clearInterval(idleTick)
  try { await selesai(session.sesiId) } catch {}
  session.resetSession()
  router.replace('/')
}
</script>
