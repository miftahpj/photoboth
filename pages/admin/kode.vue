<template>
  <div class="p-6">
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h1 class="font-display text-3xl text-airmail-ink tracking-widest">KODE AKSES</h1>
        <p class="font-courier text-gray-500 text-sm mt-1">Buat dan kelola kode akses</p>
      </div>
    </div>

    <!-- Generate form -->
    <div class="bg-white border-2 border-gray-200 p-4 mb-6">
      <p class="font-display text-sm tracking-widest uppercase text-airmail-ink mb-4">BUAT KODE BARU</p>
      <div class="flex flex-wrap gap-4 items-end">
        <div>
          <label class="font-courier text-xs text-gray-400 tracking-wider uppercase block mb-1">Jenis</label>
          <select v-model="genForm.jenis" class="border border-gray-300 font-courier text-sm px-3 py-2 focus:border-airmail-red outline-none">
            <option value="utama">Utama (10 menit)</option>
            <option value="ekstensi">Ekstensi (+5 menit)</option>
          </select>
        </div>
        <div>
          <label class="font-courier text-xs text-gray-400 tracking-wider uppercase block mb-1">Jumlah</label>
          <input v-model.number="genForm.jumlah" type="number" min="1" max="50"
            class="border border-gray-300 font-courier text-sm px-3 py-2 w-24 focus:border-airmail-red outline-none"
          />
        </div>
        <button @click="generateCodes" :disabled="generating" class="btn-primary text-xs py-2">
          {{ generating ? 'Membuat...' : 'BUAT KODE' }}
        </button>
      </div>

      <!-- Newly generated -->
      <div v-if="newCodes.length" class="mt-4 border-t border-gray-100 pt-4">
        <p class="font-courier text-xs text-gray-400 mb-2">Kode baru dibuat:</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="c in newCodes" :key="c.id"
            class="font-courier text-sm bg-airmail-cream border border-airmail-tan px-2 py-1 tracking-widest"
          >{{ c.kode }}</span>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex gap-3 mb-4 flex-wrap">
      <button v-for="f in filterOptions" :key="f.value"
        @click="filter = f.value"
        :class="filter === f.value ? 'bg-airmail-ink text-airmail-cream' : 'bg-white text-airmail-ink border-gray-300'"
        class="font-courier text-xs uppercase tracking-widest px-3 py-1 border-2 transition-colors"
      >{{ f.label }}</button>
    </div>

    <!-- Table -->
    <div class="bg-white border-2 border-gray-200 overflow-x-auto">
      <div v-if="loading" class="p-6 text-center">
        <p class="font-courier text-sm text-gray-400 animate-pulse">Memuat kode...</p>
      </div>
      <table v-else class="w-full text-sm">
        <thead class="border-b-2 border-gray-200 bg-gray-50">
          <tr>
            <th class="text-left font-display text-xs tracking-widest uppercase p-3 text-airmail-ink">Kode</th>
            <th class="text-left font-display text-xs tracking-widest uppercase p-3 text-airmail-ink">Jenis</th>
            <th class="text-left font-display text-xs tracking-widest uppercase p-3 text-airmail-ink">Status</th>
            <th class="text-left font-display text-xs tracking-widest uppercase p-3 text-airmail-ink">Digunakan</th>
            <th class="text-left font-display text-xs tracking-widest uppercase p-3 text-airmail-ink">Dibuat</th>
            <th class="p-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="kode in filteredCodes" :key="kode.id" class="hover:bg-gray-50">
            <td class="p-3 font-courier text-sm tracking-widest font-bold text-airmail-ink">{{ kode.kode }}</td>
            <td class="p-3">
              <span class="font-courier text-xs px-2 py-0.5 uppercase"
                :class="kode.jenis_kode === 'utama' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
              >{{ kode.jenis_kode }}</span>
            </td>
            <td class="p-3">
              <span class="font-courier text-xs px-2 py-0.5 uppercase"
                :class="kode.is_aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >{{ kode.is_aktif ? 'Aktif' : 'Nonaktif' }}</span>
            </td>
            <td class="p-3">
              <span class="font-courier text-xs" :class="kode.is_digunakan ? 'text-gray-400 line-through' : 'text-green-600'">
                {{ kode.is_digunakan ? 'Ya' : 'Belum' }}
              </span>
            </td>
            <td class="p-3 font-courier text-xs text-gray-400">{{ formatDate(kode.created_at) }}</td>
            <td class="p-3">
              <button
                v-if="!kode.is_digunakan"
                @click="toggleAktif(kode)"
                class="font-courier text-xs text-airmail-blue hover:text-airmail-red transition-colors"
              >
                {{ kode.is_aktif ? 'Nonaktifkan' : 'Aktifkan' }}
              </button>
            </td>
          </tr>
          <tr v-if="filteredCodes.length === 0">
            <td colspan="6" class="p-6 text-center font-courier text-sm text-gray-400">
              Tidak ada kode ditemukan
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { getAll, generate, toggleAktif: toggle } = useKodeAkses()

const loading   = ref(true)
const generating = ref(false)
const codes     = ref([])
const newCodes  = ref([])
const filter    = ref('all')
const genForm   = reactive({ jenis: 'utama', jumlah: 5 })

const filterOptions = [
  { value: 'all', label: 'Semua' },
  { value: 'utama', label: 'Utama' },
  { value: 'ekstensi', label: 'Ekstensi' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'digunakan', label: 'Digunakan' },
]

const filteredCodes = computed(() => {
  if (filter.value === 'all') return codes.value
  if (filter.value === 'aktif') return codes.value.filter(c => c.is_aktif && !c.is_digunakan)
  if (filter.value === 'digunakan') return codes.value.filter(c => c.is_digunakan)
  return codes.value.filter(c => c.jenis_kode === filter.value)
})

onMounted(async () => {
  await fetchCodes()
})

async function fetchCodes() {
  loading.value = true
  try { codes.value = await getAll() }
  catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function generateCodes() {
  generating.value = true
  newCodes.value = []
  try {
    newCodes.value = await generate(genForm.jenis, genForm.jumlah)
    await fetchCodes()
  } catch (e) { console.error(e) }
  finally { generating.value = false }
}

async function toggleAktif(kode) {
  try {
    await toggle(kode.id, !kode.is_aktif)
    kode.is_aktif = !kode.is_aktif
  } catch (e) { console.error(e) }
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
