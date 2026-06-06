<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="font-display text-3xl text-airmail-ink tracking-widest">KELOLA FRAME</h1>
      <p class="font-courier text-gray-500 text-sm mt-1">Upload dan kelola template frame</p>
    </div>

    <!-- Existing frames -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div v-for="frame in frames" :key="frame.id" class="bg-white border-2 border-gray-200 p-4">
        <div class="aspect-square border border-gray-200 mb-3 overflow-hidden bg-gray-50 flex items-center justify-center">
          <img v-if="frame.file_template" :src="frame.file_template" class="max-w-full max-h-full object-contain" />
          <div v-else class="text-center">
            <p class="font-courier text-xs text-gray-400">{{ frame.layout_cols }} × {{ frame.layout_rows }}</p>
            <p class="font-courier text-2xl mt-1">🖼️</p>
          </div>
        </div>
        <p class="font-display text-sm tracking-widest text-airmail-ink uppercase mb-1">{{ frame.nama_frame }}</p>
        <p class="font-courier text-xs text-gray-400 mb-3">
          {{ frame.layout_cols }} kol × {{ frame.layout_rows }} baris · {{ frame.kapasitas }} foto
        </p>
        <div class="flex gap-2 items-center">
          <span
            class="font-courier text-xs px-2 py-0.5"
            :class="frame.is_aktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
          >{{ frame.is_aktif ? 'Aktif' : 'Nonaktif' }}</span>
        </div>
      </div>

      <!-- Add new frame card -->
      <div
        @click="showAddModal = true"
        class="bg-white border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:border-airmail-red hover:bg-red-50 transition-colors aspect-auto min-h-48"
      >
        <span class="text-4xl mb-2">➕</span>
        <p class="font-display text-sm tracking-widest text-gray-400 uppercase">Tambah Frame</p>
      </div>
    </div>

    <!-- Add Frame Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white border-4 border-airmail-ink max-w-md w-full p-6">
        <h2 class="font-display text-xl tracking-widest text-airmail-ink mb-4">TAMBAH FRAME BARU</h2>

        <div class="space-y-4 mb-6">
          <div>
            <label class="font-courier text-xs text-gray-500 uppercase tracking-wider block mb-1">Nama Frame</label>
            <input v-model="newFrame.nama_frame" type="text" class="w-full border border-gray-300 font-courier text-sm px-3 py-2 focus:border-airmail-red outline-none" placeholder="Contoh: Portrait 2x3" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-courier text-xs text-gray-500 uppercase tracking-wider block mb-1">Kolom</label>
              <input v-model.number="newFrame.layout_cols" type="number" min="1" max="5" class="w-full border border-gray-300 font-courier text-sm px-3 py-2 focus:border-airmail-red outline-none" />
            </div>
            <div>
              <label class="font-courier text-xs text-gray-500 uppercase tracking-wider block mb-1">Baris</label>
              <input v-model.number="newFrame.layout_rows" type="number" min="1" max="5" class="w-full border border-gray-300 font-courier text-sm px-3 py-2 focus:border-airmail-red outline-none" />
            </div>
          </div>
          <div>
            <label class="font-courier text-xs text-gray-500 uppercase tracking-wider block mb-1">URL Template PNG</label>
            <input v-model="newFrame.file_template" type="text" class="w-full border border-gray-300 font-courier text-sm px-3 py-2 focus:border-airmail-red outline-none" placeholder="/frames/my-frame.png" />
            <p class="font-courier text-xs text-gray-400 mt-1">Unggah ke Supabase Storage lalu tempel URL-nya</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="addFrame" :disabled="saving" class="btn-primary text-sm flex-1">
            {{ saving ? 'Menyimpan...' : 'SIMPAN' }}
          </button>
          <button @click="showAddModal = false" class="btn-outline text-sm">BATAL</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const db = useSupabaseClient()
const { getAll } = useMasterFrame()

const frames       = ref([])
const showAddModal = ref(false)
const saving       = ref(false)
const newFrame     = reactive({ nama_frame: '', layout_cols: 2, layout_rows: 3, file_template: '' })

onMounted(async () => {
  try {
    const { data } = await db.from('master_frame').select('*').order('created_at')
    frames.value = data || []
  } catch (e) { console.error(e) }
})

async function addFrame() {
  if (!newFrame.nama_frame) return
  saving.value = true
  try {
    const { data, error } = await db.from('master_frame').insert({
      nama_frame: newFrame.nama_frame,
      layout_cols: newFrame.layout_cols,
      layout_rows: newFrame.layout_rows,
      kapasitas: newFrame.layout_cols * newFrame.layout_rows,
      file_template: newFrame.file_template || '',
    }).select().single()
    if (error) throw error
    frames.value.unshift(data)
    showAddModal.value = false
    Object.assign(newFrame, { nama_frame: '', layout_cols: 2, layout_rows: 3, file_template: '' })
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}
</script>
