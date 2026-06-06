import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', () => {
  const sesiId        = ref<number | null>(null)
  const kodeSesi      = ref<string | null>(null)
  const status        = ref<'idle' | 'aktif' | 'ekstensi' | 'pilih_frame' | 'selesai'>('idle')
  const waktuMulai    = ref<Date | null>(null)
  const durasiDetik   = ref(600)
  const sisaDetik     = ref(600)
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)

  const fotoList      = ref<any[]>([])
  const fotoPilihan   = ref<any[]>([])
  const frameId       = ref<number | null>(null)
  const hasilFrameId  = ref<number | null>(null)
  const slotFotos     = ref<(any | null)[]>(Array(6).fill(null))

  const isTimerRunning = computed(() => timerInterval.value !== null)
  const timerPercent   = computed(() => (sisaDetik.value / durasiDetik.value) * 100)
  const timerLabel     = computed(() => {
    const m = Math.floor(sisaDetik.value / 60)
    const s = sisaDetik.value % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  })
  const isExpired = computed(() => sisaDetik.value <= 0)

  function initSesi(id: number, kode: string) {
    sesiId.value      = id
    kodeSesi.value    = kode
    status.value      = 'aktif'
    fotoList.value    = []
    fotoPilihan.value = []
    slotFotos.value   = Array(6).fill(null)
  }

  function startTimer(durasi = 600) {
    stopTimer()
    durasiDetik.value = durasi
    sisaDetik.value   = durasi
    waktuMulai.value  = new Date()
    timerInterval.value = setInterval(() => {
      if (sisaDetik.value > 0) { sisaDetik.value-- } else { stopTimer() }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  function addFoto(foto: any) { fotoList.value.push(foto) }

  function resetSession() {
    stopTimer()
    sesiId.value       = null
    kodeSesi.value     = null
    status.value       = 'idle'
    waktuMulai.value   = null
    sisaDetik.value    = 600
    fotoList.value     = []
    fotoPilihan.value  = []
    frameId.value      = null
    hasilFrameId.value = null
    slotFotos.value    = Array(6).fill(null)
  }

  return {
    sesiId, kodeSesi, status, waktuMulai,
    durasiDetik, sisaDetik, timerInterval,
    fotoList, fotoPilihan, frameId, hasilFrameId, slotFotos,
    isTimerRunning, timerPercent, timerLabel, isExpired,
    initSesi, startTimer, stopTimer, addFoto, resetSession,
  }
})
