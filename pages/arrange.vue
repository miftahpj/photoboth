<template>
  <div class="min-h-[calc(100vh-6rem)] px-4 py-6 pb-12">

    <div class="text-center mb-6">
      <div class="section-stamp mb-3">TATA FOTO</div>
      <h1 class="font-display text-3xl text-airmail-ink">SERET FOTO KE DALAM FRAME</h1>
      <p class="font-courier text-airmail-stamp text-xs mt-1">Drag foto dari bawah ke dalam slot frame</p>
    </div>

    <div class="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-start">

      <!-- Frame area -->
      <div class="flex-1">
        <div class="relative paper-card border-4 border-airmail-ink shadow-frame overflow-hidden">
          <!-- Airmail border stripes -->
          <div class="h-3" style="background: repeating-linear-gradient(90deg, #C0392B 0px, #C0392B 10px, #fff 10px, #fff 20px, #1A3A6B 20px, #1A3A6B 30px);"></div>

          <div class="p-4">
            <!-- Frame title stamp -->
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="font-display text-xs tracking-[0.3em] text-airmail-red uppercase">RAFIKOSAN</p>
                <p class="font-display text-lg text-airmail-ink tracking-widest">lemillion project</p>
              </div>
              <div class="border-2 border-airmail-stamp p-1 rotate-[3deg]">
                <div class="w-10 h-12 bg-airmail-tan/30 flex items-center justify-center border border-airmail-stamp">
                  <span class="text-lg">📮</span>
                </div>
              </div>
            </div>

            <!-- Photo grid slots -->
            <div
              class="grid gap-2"
              :style="{
                gridTemplateColumns: `repeat(${currentFrame?.layout_cols || 2}, 1fr)`,
                gridTemplateRows: `repeat(${currentFrame?.layout_rows || 3}, 1fr)`,
              }"
            >
              <div
                v-for="(slot, idx) in slots"
                :key="idx"
                class="drop-slot aspect-square"
                :class="{
                  'filled': slot !== null,
                  'drag-over': dragOverSlot === idx,
                }"
                @dragover.prevent="dragOverSlot = idx"
                @dragleave="dragOverSlot = null"
                @drop.prevent="onDrop(idx, $event)"
              >
                <template v-if="slot">
                  <img
                    :src="slot.path_file"
                    :alt="`Slot ${idx+1}`"
                    class="w-full h-full object-cover"
                    draggable="false"
                  />
                  <!-- Remove button -->
                  <button
                    @click="removeFromSlot(idx)"
                    class="absolute top-1 right-1 w-5 h-5 bg-airmail-red text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-800 transition-colors z-10"
                  >×</button>
                  <!-- Position number badge -->
                  <div class="absolute bottom-1 left-1 w-5 h-5 bg-airmail-ink text-white text-xs font-courier flex items-center justify-center">
                    {{ idx + 1 }}
                  </div>
                </template>
                <template v-else>
                  <div class="text-center pointer-events-none">
                    <p class="font-display text-airmail-tan text-2xl">{{ idx + 1 }}</p>
                    <p class="font-courier text-airmail-tan text-xs">DROP<br>HERE</p>
                  </div>
                </template>
              </div>
            </div>

            <!-- Airmail caption area -->
            <div class="mt-3 border-t border-airmail-tan pt-2 flex justify-between items-end">
              <div>
                <p class="font-courier text-xs text-airmail-stamp">PAR AVION</p>
                <p class="font-display text-xs text-airmail-tan">VIA AIR MAIL</p>
              </div>
              <div class="text-right">
                <p class="font-courier text-xs text-airmail-stamp">{{ sessionDate }}</p>
                <p class="font-courier text-xs text-airmail-tan">{{ session.kodeSesi?.slice(0,8).toUpperCase() }}</p>
              </div>
            </div>
          </div>

          <div class="h-3" style="background: repeating-linear-gradient(90deg, #1A3A6B 0px, #1A3A6B 10px, #fff 10px, #fff 20px, #C0392B 20px, #C0392B 30px);"></div>
        </div>

        <!-- Filled indicator -->
        <div class="mt-2 text-center">
          <span
            v-if="filledCount === 6"
            class="section-stamp text-green-700 border-green-700 animate-stamp-in"
          >✓ SEMUA SLOT TERISI</span>
          <span v-else class="font-courier text-xs text-airmail-stamp">{{ filledCount }}/6 terisi</span>
        </div>
      </div>

      <!-- Photo tray (source) -->
      <div class="lg:w-48 w-full">
        <p class="font-display text-xs tracking-widest text-airmail-ink uppercase mb-2">FOTO PILIHAN</p>
        <div class="flex lg:flex-col flex-row flex-wrap gap-2">
          <div
            v-for="foto in unusedPhotos"
            :key="foto.id"
            draggable="true"
            @dragstart="onDragStart(foto, $event)"
            @dragend="dragOverSlot = null"
            class="w-20 h-20 border-2 border-airmail-ink overflow-hidden cursor-grab active:cursor-grabbing shadow-photo hover:border-airmail-red transition-colors flex-shrink-0"
          >
            <img :src="foto.path_file" class="w-full h-full object-cover pointer-events-none" />
          </div>
          <div v-if="unusedPhotos.length === 0" class="font-courier text-xs text-airmail-stamp text-center py-4 w-full">
            Semua foto sudah ditempatkan!
          </div>
        </div>
      </div>

    </div>

    <!-- Action bar -->
    <div class="fixed bottom-4 left-0 right-0 flex justify-center gap-3 px-4 z-40">
      <button @click="resetSlots" class="btn-outline text-xs py-2 px-4">RESET</button>
      <button @click="$router.push('/select-layout')" class="btn-outline text-xs py-2 px-4">← LAYOUT</button>
      <button
        @click="proceedToPrint"
        :disabled="filledCount < 6 || saving"
        class="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {{ saving ? 'Menyimpan...' : 'CETAK PHOTO →' }}
      </button>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const router  = useRouter()
const session = useSessionStore()
const { getAll: getFrames } = useMasterFrame()
const { create: createHasil, savePosisi } = useHasilFrame()
const { updateStatus } = useSesi()

const slots        = ref(Array(6).fill(null))
const dragOverSlot = ref(null)
const draggingFoto = ref(null)
const saving       = ref(false)
const currentFrame = ref(null)

const filledCount = computed(() => slots.value.filter(s => s !== null).length)
const unusedPhotos = computed(() =>
  session.fotoPilihan.filter(f => !slots.value.some(s => s?.id === f.id))
)
const sessionDate = computed(() => new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }))

onMounted(async () => {
  if (!session.sesiId || !session.fotoPilihan.length || !session.frameId) {
    router.replace('/select-layout')
    return
  }
  // Restore slots if re-visiting
  slots.value = [...session.slotFotos]
  try {
    const frames = await getFrames()
    currentFrame.value = frames.find(f => f.id === session.frameId)
  } catch (e) { console.error(e) }
})

function onDragStart(foto, e) {
  draggingFoto.value = foto
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', foto.id)
}

function onDrop(idx, e) {
  dragOverSlot.value = null
  if (!draggingFoto.value) return
  // If foto already in another slot, clear it
  const existingIdx = slots.value.findIndex(s => s?.id === draggingFoto.value.id)
  if (existingIdx !== -1) slots.value[existingIdx] = null
  slots.value[idx] = draggingFoto.value
  session.slotFotos = [...slots.value]
  draggingFoto.value = null
}

function removeFromSlot(idx) {
  slots.value[idx] = null
  session.slotFotos = [...slots.value]
}

function resetSlots() {
  slots.value = Array(6).fill(null)
  session.slotFotos = [...slots.value]
}

async function proceedToPrint() {
  if (filledCount.value < 6 || saving.value) return
  saving.value = true
  try {
    const hasil = await createHasil(session.sesiId, session.frameId)
    session.hasilFrameId = hasil.id
    const posisi = slots.value.map((foto, idx) => ({
      id_foto: foto.id,
      urutan_posisi: idx + 1,
    }))
    await savePosisi(hasil.id, posisi)
    await updateStatus(session.sesiId, 'selesai')
    router.push('/result')
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>
