<template>
  <div class="min-h-[calc(100vh-6rem)] px-4 py-8 pb-12">

    <div class="text-center mb-8">
      <div class="section-stamp mb-3">PILIH LAYOUT</div>
      <h1 class="font-display text-4xl text-airmail-ink">PILIH FRAME ANDA</h1>
      <p class="font-courier text-airmail-stamp text-sm mt-2">
        Frame vintage airmail eksklusif — RAFIKOSAN lemillion
      </p>
    </div>

    <div v-if="loading" class="text-center py-16">
      <p class="font-courier text-airmail-stamp animate-pulse">Memuat frame...</p>
    </div>

    <div v-else class="max-w-3xl mx-auto">

      <!-- Frame options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          v-for="frame in frames"
          :key="frame.id"
          @click="selectedFrame = frame"
          class="cursor-pointer transition-all duration-200 group"
          :class="selectedFrame?.id === frame.id ? 'scale-105' : 'hover:scale-102'"
        >
          <!-- Frame preview card -->
          <div
            class="paper-card p-4 border-4 transition-all duration-200"
            :class="selectedFrame?.id === frame.id
              ? 'border-airmail-red shadow-frame'
              : 'border-airmail-tan group-hover:border-airmail-ink'"
          >
            <!-- Airmail stripe top -->
            <div class="h-2 mb-3 rounded-sm" style="background: repeating-linear-gradient(90deg, #C0392B 0px, #C0392B 8px, #fff 8px, #fff 16px, #1A3A6B 16px, #1A3A6B 24px);"></div>

            <!-- Grid preview -->
            <div
              class="border-2 border-airmail-ink p-1 mb-3"
              :style="{ aspectRatio: frame.layout_cols === 3 ? '3/2' : '2/3' }"
            >
              <div
                class="grid w-full h-full gap-0.5"
                :style="{
                  gridTemplateColumns: `repeat(${frame.layout_cols}, 1fr)`,
                  gridTemplateRows: `repeat(${frame.layout_rows}, 1fr)`,
                }"
              >
                <div
                  v-for="slot in frame.kapasitas"
                  :key="slot"
                  class="bg-airmail-tan/30 border border-dashed border-airmail-tan flex items-center justify-center"
                >
                  <span class="text-airmail-tan text-xs font-courier">{{ slot }}</span>
                </div>
              </div>
            </div>

            <!-- Stamp + label -->
            <div class="flex items-center justify-between">
              <div>
                <p class="font-display text-sm text-airmail-ink tracking-widest uppercase">{{ frame.nama_frame }}</p>
                <p class="font-courier text-xs text-airmail-stamp">{{ frame.layout_cols }} × {{ frame.layout_rows }} slots · {{ frame.kapasitas }} foto</p>
              </div>
              <div
                class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all"
                :class="selectedFrame?.id === frame.id
                  ? 'bg-airmail-red border-airmail-red'
                  : 'bg-transparent border-airmail-tan group-hover:border-airmail-ink'"
              >
                <span v-if="selectedFrame?.id === frame.id" class="text-white text-xs">✓</span>
              </div>
            </div>

            <!-- Airmail stripe bottom -->
            <div class="h-2 mt-3 rounded-sm" style="background: repeating-linear-gradient(90deg, #1A3A6B 0px, #1A3A6B 8px, #fff 8px, #fff 16px, #C0392B 16px, #C0392B 24px);"></div>
          </div>

          <!-- "SELECTED" stamp -->
          <div v-if="selectedFrame?.id === frame.id" class="text-center mt-2">
            <span class="section-stamp text-airmail-red border-airmail-red animate-stamp-in">✓ DIPILIH</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between items-center">
        <button @click="$router.push('/select-photos')" class="btn-outline text-sm">
          ← UBAH FOTO
        </button>
        <button
          @click="proceed"
          :disabled="!selectedFrame"
          class="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          TATA FOTO →
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const router  = useRouter()
const session = useSessionStore()
const { getAll } = useMasterFrame()

const frames = ref([])
const loading = ref(true)
const selectedFrame = ref(null)

onMounted(async () => {
  if (!session.sesiId) { router.replace('/'); return }
  try {
    frames.value = await getAll()
    // Restore if previously chosen
    if (session.frameId) {
      selectedFrame.value = frames.value.find(f => f.id === session.frameId) || null
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function proceed() {
  if (!selectedFrame.value) return
  session.frameId = selectedFrame.value.id
  router.push('/arrange')
}
</script>
