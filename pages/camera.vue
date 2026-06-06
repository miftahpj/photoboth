<template>
  <div class="min-h-[calc(100vh-6rem)] flex flex-col pb-6">

    <!-- Flash overlay -->
    <div v-if="showFlash" class="fixed inset-0 bg-white z-50 flash-overlay pointer-events-none"></div>

    <!-- Timeout modal -->
    <TimeoutModal
      v-if="showTimeoutModal"
      @ekstensi="handleEkstensi"
      @lanjut-frame="goToSelectPhotos"
      @batalkan="goToSelectPhotos"
    />

    <!-- Timer bar -->
    <div class="w-full bg-airmail-tan/30 h-2">
      <div
        class="timer-bar"
        :style="{ width: session.timerPercent + '%' }"
        :class="session.sisaDetik < 60 ? 'bg-airmail-red' : 'bg-airmail-blue'"
      ></div>
    </div>

    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-2 border-b border-airmail-tan/50">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-airmail-red animate-pulse"></div>
        <span class="font-courier text-xs text-airmail-stamp tracking-widest uppercase">LIVE</span>
      </div>
      <div
        class="font-display text-2xl tracking-widest"
        :class="session.sisaDetik < 60 ? 'text-airmail-red animate-pulse' : 'text-airmail-ink'"
      >
        {{ session.timerLabel }}
      </div>
      <div class="font-courier text-xs text-airmail-stamp tracking-widest">
        {{ session.fotoList.length }} FOTO
      </div>
    </div>

    <!-- Camera area -->
    <div class="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-4">

      <!-- Viewfinder -->
      <div class="relative w-full max-w-2xl">
        <div class="airmail-border rounded-none">
          <div class="relative bg-black aspect-[4/3] overflow-hidden">
            <video
              ref="videoEl"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover"
              :class="{ 'opacity-0': !cameraReady }"
            ></video>
            <canvas ref="canvasEl" class="hidden"></canvas>

            <!-- Camera not ready -->
            <div v-if="!cameraReady" class="absolute inset-0 flex flex-col items-center justify-center bg-airmail-ink/90">
              <span class="text-4xl mb-3">📷</span>
              <p class="font-display text-airmail-cream tracking-widest text-sm">{{ cameraError || 'Memuat kamera...' }}</p>
            </div>

            <!-- Countdown overlay -->
            <Transition name="countdown">
              <div v-if="countdownNum > 0" class="absolute inset-0 flex items-center justify-center">
                <span class="font-display text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                  :style="{ fontSize: '14rem', lineHeight: 1, textShadow: '4px 4px 0 #C0392B' }">
                  {{ countdownNum }}
                </span>
              </div>
            </Transition>

            <!-- Viewfinder corners -->
            <div class="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-airmail-red"></div>
            <div class="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-airmail-red"></div>
            <div class="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-airmail-red"></div>
            <div class="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-airmail-red"></div>
          </div>
        </div>
      </div>

      <!-- Shutter button -->
      <div class="flex items-center gap-6">
        <div class="font-courier text-xs text-airmail-stamp text-center tracking-wider">
          <p>JEPRET</p>
          <p class="text-airmail-ink font-bold text-lg">{{ session.fotoList.length }}/6+</p>
        </div>

        <button
          @click="takePhoto"
          :disabled="isShooting || !cameraReady || countdownNum > 0"
          class="w-20 h-20 rounded-full border-4 border-airmail-ink bg-airmail-cream shadow-stamp flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-airmail-red hover:border-airmail-ink group"
        >
          <div class="w-14 h-14 rounded-full border-2 border-airmail-ink bg-white group-hover:bg-airmail-cream transition-colors"></div>
        </button>

        <div class="font-courier text-xs text-airmail-stamp text-center tracking-wider">
          <p>TERSISA</p>
          <p class="text-airmail-ink font-bold text-lg">{{ session.timerLabel }}</p>
        </div>
      </div>

      <!-- Continue button (visible after 6+ photos) -->
      <Transition name="fade">
        <button
          v-if="session.fotoList.length >= 6"
          @click="goToSelectPhotos"
          class="btn-secondary animate-fade-up text-sm tracking-[0.2em]"
        >
          LANJUT KE SESI FRAME →
        </button>
      </Transition>
    </div>

    <!-- Photo strip thumbnail row -->
    <div class="px-4 pb-2">
      <div class="flex gap-2 overflow-x-auto pb-1">
        <div
          v-for="(foto, i) in session.fotoList"
          :key="foto.id"
          class="flex-shrink-0 w-16 h-16 border-2 border-airmail-ink overflow-hidden shadow-photo animate-fade-up"
        >
          <img :src="foto.path_file" :alt="`Foto ${i+1}`" class="w-full h-full object-cover" />
        </div>
        <!-- Empty placeholders -->
        <div
          v-for="i in Math.max(0, 6 - session.fotoList.length)"
          :key="'empty-' + i"
          class="flex-shrink-0 w-16 h-16 border-2 border-dashed border-airmail-tan flex items-center justify-center"
        >
          <span class="text-airmail-tan text-xs">{{ session.fotoList.length + i }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const router  = useRouter()
const session = useSessionStore()
const { upload } = useFoto()
const { updateStatus } = useSesi()

const videoEl   = ref(null)
const canvasEl  = ref(null)
const cameraReady = ref(false)
const cameraError = ref('')
const isShooting  = ref(false)
const showFlash   = ref(false)
const countdownNum = ref(0)
const showTimeoutModal = ref(false)

let stream = null

onMounted(async () => {
  if (!session.sesiId) { router.replace('/'); return }
  await initCamera()

  // Watch for timer expiry
  watch(() => session.isExpired, (expired) => {
    if (expired) showTimeoutModal.value = true
  })
})

onBeforeUnmount(() => {
  if (stream) stream.getTracks().forEach(t => t.stop())
})

async function initCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
      audio: false,
    })
    if (videoEl.value) {
      videoEl.value.srcObject = stream
      videoEl.value.onloadedmetadata = () => { cameraReady.value = true }
    }
  } catch (e) {
    cameraError.value = 'Tidak dapat mengakses kamera'
    console.error(e)
  }
}

async function takePhoto() {
  if (isShooting.value || !cameraReady.value) return
  isShooting.value = true

  // 3-2-1 countdown
  for (let i = 3; i >= 1; i--) {
    countdownNum.value = i
    await new Promise(r => setTimeout(r, 1000))
  }
  countdownNum.value = 0

  // Flash
  showFlash.value = true
  setTimeout(() => { showFlash.value = false }, 400)

  // Capture
  const video  = videoEl.value
  const canvas = canvasEl.value
  canvas.width  = video.videoWidth  || 1280
  canvas.height = video.videoHeight || 960
  canvas.getContext('2d').drawImage(video, 0, 0)

  canvas.toBlob(async (blob) => {
    try {
      const filename = `foto-${Date.now()}.jpg`
      const foto = await upload(session.sesiId, blob, filename)
      session.addFoto(foto)
    } catch (e) {
      console.error('Upload failed:', e)
    } finally {
      isShooting.value = false
    }
  }, 'image/jpeg', 0.92)
}

async function goToSelectPhotos() {
  showTimeoutModal.value = false
  session.stopTimer()
  await updateStatus(session.sesiId, 'pilih_frame')
  session.status = 'pilih_frame'
  if (stream) stream.getTracks().forEach(t => t.stop())
  router.push('/select-photos')
}

function handleEkstensi() {
  showTimeoutModal.value = false
  router.push('/ekstensi')
}
</script>

<style scoped>
.countdown-enter-active { animation: countdown 0.5s ease-out; }
.countdown-leave-active { animation: countdown 0.3s ease-in reverse; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
