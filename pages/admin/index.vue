<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="font-display text-3xl text-airmail-ink tracking-widest">DASHBOARD</h1>
      <p class="font-courier text-gray-500 text-sm mt-1">{{ today }}</p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="bg-white border-2 border-gray-200 p-4 shadow-sm">
        <p class="font-courier text-xs text-gray-400 tracking-widest uppercase mb-1">{{ stat.label }}</p>
        <p class="font-display text-3xl text-airmail-ink">{{ stat.value }}</p>
        <p v-if="stat.sub" class="font-courier text-xs text-gray-400 mt-1">{{ stat.sub }}</p>
      </div>
    </div>

    <!-- Recent sessions -->
    <div class="bg-white border-2 border-gray-200">
      <div class="border-b-2 border-gray-200 px-4 py-3 flex items-center justify-between">
        <p class="font-display text-sm tracking-widest uppercase text-airmail-ink">Sesi Terbaru</p>
        <NuxtLink to="/admin/sesi" class="font-courier text-xs text-airmail-blue hover:text-airmail-red transition-colors">Lihat semua →</NuxtLink>
      </div>
      <div v-if="loadingStats" class="p-6 text-center">
        <p class="font-courier text-sm text-gray-400 animate-pulse">Memuat data...</p>
      </div>
      <div v-else-if="recentSessions.length === 0" class="p-6 text-center">
        <p class="font-courier text-sm text-gray-400">Belum ada sesi hari ini</p>
      </div>
      <div v-else class="divide-y divide-gray-100">
        <div v-for="sesi in recentSessions" :key="sesi.id" class="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
          <div>
            <p class="font-courier text-sm text-airmail-ink">{{ sesi.kode_sesi?.slice(0,8).toUpperCase() }}</p>
            <p class="font-courier text-xs text-gray-400">{{ formatTime(sesi.created_at) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="font-courier text-xs px-2 py-0.5 uppercase tracking-wider"
              :class="{
                'bg-green-100 text-green-700': sesi.status === 'selesai',
                'bg-blue-100 text-blue-700': sesi.status === 'aktif',
                'bg-yellow-100 text-yellow-700': sesi.status === 'ekstensi',
                'bg-gray-100 text-gray-600': sesi.status === 'pilih_frame',
              }"
            >{{ sesi.status }}</span>
            <NuxtLink :to="`/view/${sesi.kode_sesi}`" target="_blank" class="font-courier text-xs text-airmail-blue hover:text-airmail-red">
              Lihat →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const { getAll: getAllSesi } = useSesi()

const loadingStats   = ref(true)
const recentSessions = ref([])
const allSesiToday   = ref([])

const stats = computed(() => {
  const revenue = allSesiToday.value.reduce((sum, s) => {
    return sum + (s.transaksi?.reduce((t, tr) => t + (tr.jumlah || 0), 0) || 0)
  }, 0)
  const selesai = allSesiToday.value.filter(s => s.status === 'selesai').length
  return [
    { label: 'Sesi Hari Ini', value: allSesiToday.value.length },
    { label: 'Selesai', value: selesai },
    { label: 'Aktif', value: allSesiToday.value.filter(s => s.status === 'aktif' || s.status === 'ekstensi').length },
    { label: 'Pendapatan', value: `Rp ${revenue.toLocaleString('id-ID')}`, sub: 'hari ini' },
  ]
})

onMounted(async () => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10)
    allSesiToday.value  = await getAllSesi(todayStr)
    recentSessions.value = allSesiToday.value.slice(0, 8)
  } catch (e) { console.error(e) }
  finally { loadingStats.value = false }
})

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>
