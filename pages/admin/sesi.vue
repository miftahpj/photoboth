<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="font-display text-3xl text-airmail-ink tracking-widest">SESI & FOTO</h1>
      <p class="font-courier text-gray-500 text-sm mt-1">Kelola semua sesi foto</p>
    </div>

    <!-- Filters -->
    <div class="bg-white border-2 border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-end">
      <div>
        <label class="font-courier text-xs text-gray-400 tracking-wider uppercase block mb-1">Filter Tanggal</label>
        <input
          v-model="filterDate"
          type="date"
          class="border border-gray-300 font-courier text-sm px-3 py-2 focus:border-airmail-red outline-none"
        />
      </div>
      <div>
        <label class="font-courier text-xs text-gray-400 tracking-wider uppercase block mb-1">Status</label>
        <select v-model="filterStatus" class="border border-gray-300 font-courier text-sm px-3 py-2 focus:border-airmail-red outline-none">
          <option value="">Semua</option>
          <option value="aktif">Aktif</option>
          <option value="ekstensi">Ekstensi</option>
          <option value="pilih_frame">Pilih Frame</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>
      <button @click="fetchSesi" :disabled="loading" class="btn-primary text-xs py-2 px-4">
        {{ loading ? 'Memuat...' : 'FILTER' }}
      </button>
    </div>

    <!-- Sessions list -->
    <div class="space-y-4">
      <div v-if="loading" class="text-center py-12">
        <p class="font-courier text-gray-400 animate-pulse">Memuat sesi...</p>
      </div>

      <div v-else-if="filteredSesi.length === 0" class="text-center py-12 bg-white border-2 border-gray-200">
        <p class="font-courier text-gray-400">Tidak ada sesi ditemukan</p>
      </div>

      <div v-for="sesi in filteredSesi" :key="sesi.id" class="bg-white border-2 border-gray-200">
        <!-- Session header -->
        <div class="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div>
              <p class="font-courier text-sm font-bold text-airmail-ink tracking-widest">
                {{ sesi.kode_sesi?.slice(0,8).toUpperCase() }}
              </p>
              <p class="font-courier text-xs text-gray-400">{{ formatDateTime(sesi.created_at) }}</p>
            </div>
            <span
              class="font-courier text-xs px-2 py-0.5 uppercase"
              :class="{
                'bg-green-100 text-green-700': sesi.status === 'selesai',
                'bg-blue-100 text-blue-700': sesi.status === 'aktif',
                'bg-yellow-100 text-yellow-700': sesi.status === 'ekstensi',
                'bg-purple-100 text-purple-700': sesi.status === 'pilih_frame',
              }"
            >{{ sesi.status }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-courier text-xs text-gray-400">
              Rp {{ totalRevenue(sesi).toLocaleString('id-ID') }}
            </span>
            <button
              @click="copyLink(sesi.kode_sesi)"
              class="font-courier text-xs text-airmail-blue hover:text-airmail-red transition-colors"
            >
              {{ copiedId === sesi.kode_sesi ? '✓ SALIN' : 'SALIN LINK' }}
            </button>
            <NuxtLink :to="`/view/${sesi.kode_sesi}`" target="_blank"
              class="font-courier text-xs text-airmail-blue hover:text-airmail-red transition-colors">
              LIHAT →
            </NuxtLink>
            <button @click="toggleExpand(sesi.id)" class="font-courier text-xs text-gray-400">
              {{ expanded === sesi.id ? '▲ TUTUP' : '▼ BUKA' }}
            </button>
          </div>
        </div>

        <!-- Expanded detail -->
        <div v-if="expanded === sesi.id" class="p-4">
          <p class="font-display text-xs tracking-widest uppercase text-gray-400 mb-2">
            FOTO ({{ sesi.foto?.length || 0 }})
          </p>
          <div class="flex flex-wrap gap-2">
            <div v-for="foto in sesi.foto" :key="foto.id"
              class="w-16 h-16 border border-gray-200 overflow-hidden">
              <img :src="foto.path_file" class="w-full h-full object-cover" />
            </div>
            <div v-if="!sesi.foto?.length" class="font-courier text-xs text-gray-400">Belum ada foto</div>
          </div>

          <div v-if="sesi.transaksi?.length" class="mt-3">
            <p class="font-display text-xs tracking-widest uppercase text-gray-400 mb-2">TRANSAKSI</p>
            <div class="space-y-1">
              <div v-for="t in sesi.transaksi" :key="t.id" class="flex gap-4 font-courier text-xs text-gray-600">
                <span class="capitalize">{{ t.tujuan }}</span>
                <span class="capitalize">{{ t.jenis_bayar }}</span>
                <span>Rp {{ (t.jumlah || 0).toLocaleString('id-ID') }}</span>
                <span :class="t.status_bayar === 'sukses' ? 'text-green-600' : 'text-red-600'">{{ t.status_bayar }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { getAll } = useSesi()

const loading      = ref(true)
const sesiList     = ref([])
const filterDate   = ref(new Date().toISOString().slice(0, 10))
const filterStatus = ref('')
const expanded     = ref(null)
const copiedId     = ref(null)

const filteredSesi = computed(() => {
  if (!filterStatus.value) return sesiList.value
  return sesiList.value.filter(s => s.status === filterStatus.value)
})

onMounted(() => fetchSesi())

async function fetchSesi() {
  loading.value = true
  try { sesiList.value = await getAll(filterDate.value) }
  catch (e) { console.error(e) }
  finally { loading.value = false }
}

function toggleExpand(id) {
  expanded.value = expanded.value === id ? null : id
}

function totalRevenue(sesi) {
  return sesi.transaksi?.reduce((s, t) => s + (t.jumlah || 0), 0) || 0
}

async function copyLink(kode) {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/view/${kode}`)
    copiedId.value = kode
    setTimeout(() => { copiedId.value = null }, 2000)
  } catch {}
}

function formatDateTime(ts) {
  return new Date(ts).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>
