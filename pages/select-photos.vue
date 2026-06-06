<template>
  <div class="min-h-[calc(100vh-6rem)] px-4 py-8 pb-12">

    <!-- Header -->
    <div class="text-center mb-6">
      <div class="section-stamp mb-3">PILIH FOTO</div>
      <h1 class="font-display text-4xl text-airmail-ink">PILIH 6 FOTO TERBAIK</h1>
      <p class="font-courier text-airmail-stamp text-sm mt-2">
        Dipilih: <strong class="font-display text-airmail-ink text-lg">{{ selected.length }}</strong> / 6
      </p>
    </div>

    <!-- Progress bar -->
    <div class="max-w-lg mx-auto mb-6">
      <div class="flex justify-between mb-1">
        <span class="font-courier text-xs text-airmail-stamp">{{ selected.length }}/6 dipilih</span>
        <span v-if="selected.length === 6" class="font-courier text-xs text-green-700 font-bold">✓ Siap!</span>
      </div>
      <div class="h-2 bg-airmail-tan/40 rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-300"
          :class="selected.length === 6 ? 'bg-green-600' : 'bg-airmail-blue'"
          :style="{ width: (selected.length / 6 * 100) + '%' }"
        ></div>
      </div>
    </div>

    <!-- Photo grid -->
    <div v-if="session.fotoList.length > 0" class="max-w-4xl mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
      <div
        v-for="(foto, i) in session.fotoList"
        :key="foto.id"
        @click="toggleSelect(foto)"
        class="relative aspect-square cursor-pointer group border-2 overflow-hidden shadow-photo transition-all duration-150"
        :class="isSelected(foto)
          ? 'border-airmail-ink scale-95 shadow-stamp'
          : 'border-transparent hover:border-airmail-tan hover:scale-95'"
      >
        <img :src="foto.path_file" :alt="`Foto ${i+1}`" class="w-full h-full object-cover" />

        <!-- Selected overlay -->
        <div
          v-if="isSelected(foto)"
          class="absolute inset-0 bg-airmail-ink/30 flex items-center justify-center"
        >
          <div class="w-8 h-8 rounded-full bg-airmail-red border-2 border-white flex items-center justify-center">
            <span class="font-display text-white text-sm font-bold">{{ selectedIndex(foto) + 1 }}</span>
          </div>
        </div>

        <!-- Hover overlay (not selected) -->
        <div v-else class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div class="w-7 h-7 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <!-- Max reached indicator -->
        <div
          v-if="!isSelected(foto) && selected.length >= 6"
          class="absolute inset-0 bg-black/40 flex items-center justify-center"
        >
          <span class="font-courier text-white text-xs tracking-wider">MAX</span>
        </div>
      </div>
    </div>

    <!-- No photos -->
    <div v-else class="text-center py-16">
      <p class="font-display text-airmail-stamp text-2xl mb-4">TIDAK ADA FOTO</p>
      <NuxtLink to="/camera" class="btn-secondary text-sm">← Kembali ke Kamera</NuxtLink>
    </div>

    <!-- Bottom CTA -->
    <div class="fixed bottom-4 left-0 right-0 flex justify-center gap-3 px-4 z-40">
      <button
        @click="resetSelection"
        class="btn-outline text-xs py-2 px-4"
      >
        RESET
      </button>
      <button
        @click="proceedToLayout"
        :disabled="selected.length !== 6"
        class="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        :class="selected.length === 6 ? 'animate-fade-up' : ''"
      >
        PILIH FRAME →
      </button>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const router  = useRouter()
const session = useSessionStore()

const selected = ref([])

onMounted(() => {
  if (!session.sesiId) { router.replace('/'); return }
  // Restore previous selection if any
  if (session.fotoPilihan.length) selected.value = [...session.fotoPilihan]
})

function isSelected(foto) {
  return selected.value.some(f => f.id === foto.id)
}

function selectedIndex(foto) {
  return selected.value.findIndex(f => f.id === foto.id)
}

function toggleSelect(foto) {
  if (isSelected(foto)) {
    selected.value = selected.value.filter(f => f.id !== foto.id)
  } else if (selected.value.length < 6) {
    selected.value.push(foto)
  }
}

function resetSelection() {
  selected.value = []
}

function proceedToLayout() {
  if (selected.value.length !== 6) return
  session.fotoPilihan = [...selected.value]
  session.slotFotos   = Array(6).fill(null)
  router.push('/select-layout')
}
</script>
