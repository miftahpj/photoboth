<template>
  <div class="p-6 max-w-2xl">
    <div class="mb-6">
      <h1 class="font-display text-3xl text-airmail-ink tracking-widest">PENGATURAN</h1>
      <p class="font-courier text-gray-500 text-sm mt-1">Kelola harga dan konfigurasi sistem</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="font-courier text-gray-400 animate-pulse">Memuat pengaturan...</p>
    </div>

    <form v-else @submit.prevent="saveAll" class="space-y-4">
      <div v-for="item in pengaturanList" :key="item.kunci_pengaturan" class="bg-white border-2 border-gray-200 p-4">
        <label class="font-display text-xs tracking-widest text-airmail-ink uppercase block mb-2">
          {{ labelMap[item.kunci_pengaturan] || item.kunci_pengaturan }}
        </label>
        <div class="flex items-center gap-3">
          <span class="font-courier text-gray-400 text-sm">Rp</span>
          <input
            v-model="item.nilai"
            type="number"
            min="0"
            class="flex-1 border border-gray-300 font-courier text-lg px-3 py-2 focus:border-airmail-red outline-none"
          />
        </div>
        <p class="font-courier text-xs text-gray-400 mt-1">Kunci: {{ item.kunci_pengaturan }}</p>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button type="submit" :disabled="saving" class="btn-primary text-sm">
          {{ saving ? 'Menyimpan...' : 'SIMPAN PERUBAHAN' }}
        </button>
        <p v-if="saved" class="font-courier text-xs text-green-600 animate-fade-up">✓ Tersimpan!</p>
      </div>
    </form>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { getAll, update } = usePengaturan()

const loading = ref(true)
const saving  = ref(false)
const saved   = ref(false)
const pengaturanList = ref([])

const labelMap = {
  harga_utama:    'Harga Sesi Utama (10 Menit)',
  harga_ekstensi: 'Harga Ekstensi (+5 Menit)',
}

onMounted(async () => {
  try { pengaturanList.value = await getAll() }
  catch (e) { console.error(e) }
  finally { loading.value = false }
})

async function saveAll() {
  saving.value = true
  try {
    for (const item of pengaturanList.value) {
      await update(item.kunci_pengaturan, String(item.nilai))
    }
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}
</script>
