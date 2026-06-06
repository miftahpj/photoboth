<template>
  <div class="min-h-[calc(100vh-6rem)] px-4 py-8 pb-12">
    <div class="max-w-2xl mx-auto">

      <div class="text-center mb-6">
        <div class="section-stamp mb-2">PAR AVION</div>
        <h1 class="font-display text-4xl text-airmail-ink tracking-widest">LEMILLION PHOTO</h1>
        <p class="font-courier text-airmail-stamp text-xs mt-1 tracking-widest uppercase">
          Session ID: {{ String(kode).toUpperCase() }}
        </p>
      </div>

      <div v-if="pending" class="text-center py-16">
        <p class="font-courier text-airmail-stamp animate-pulse">Memuat sesi...</p>
      </div>

      <div v-else-if="fetchError || !sesiData" class="text-center py-16">
        <p class="font-display text-2xl text-airmail-red mb-3">SESI TIDAK DITEMUKAN</p>
        <NuxtLink to="/" class="btn-primary text-sm">MULAI SESI BARU</NuxtLink>
      </div>

      <div v-else>

        <!-- Frame preview -->
        <div v-if="hasilFrame" class="mb-4">
          <div
            ref="framePreviewEl"
            class="relative mx-auto border-2 border-airmail-ink shadow-frame overflow-hidden bg-airmail-cream"
            :style="frameContainerStyle"
          >
            <!-- Frame PNG on top -->
            <img
              v-if="frameTemplateUrl"
              :src="frameTemplateUrl"
              class="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
              crossorigin="anonymous"
            />
            <!-- Photos behind frame -->
            <div
              v-for="pos in sortedFotos"
              :key="pos.urutan_posisi"
              class="absolute overflow-hidden z-0"
              :style="getPhotoSlotStyle(pos.urutan_posisi - 1)"
            >
              <img
                :src="pos.foto && pos.foto.path_file"
                class="w-full h-full object-cover"
                crossorigin="anonymous"
              />
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-wrap gap-3 mt-4 justify-center">
            <button @click="downloadWithFrame" :disabled="downloading" class="btn-primary text-xs py-2 px-5 flex items-center gap-2">
              <span>🖼️</span> {{ downloading ? 'Menyiapkan...' : 'UNDUH FOTO + FRAME' }}
            </button>
            <button @click="downloadAllOriginal" :disabled="downloadingAll" class="btn-secondary text-xs py-2 px-5 flex items-center gap-2">
              <span>📦</span> {{ downloadingAll ? 'Mengunduh...' : 'UNDUH SEMUA FOTO ASLI' }}
            </button>
            <button @click="printFrame" class="btn-outline text-xs py-2 px-5 flex items-center gap-2">
              <span>🖨️</span> PRINT FRAME
            </button>
          </div>
        </div>

        <!-- Kliping foto individual -->
        <div class="mb-8">
          <p class="font-display text-sm tracking-widest text-airmail-ink uppercase mb-3">
            KLIPING FOTO ({{ sesiData.foto ? sesiData.foto.length : 0 }})
          </p>
          <div class="grid grid-cols-3 gap-3">
            <div v-for="foto in sesiData.foto" :key="foto.id">
              <div class="aspect-square overflow-hidden border-2 border-airmail-tan shadow-photo">
                <img :src="foto.path_file" class="w-full h-full object-cover" crossorigin="anonymous" />
              </div>
              <button
                @click="downloadSinglePhoto(foto)"
                class="mt-1 w-full font-courier text-xs py-1 px-2 bg-airmail-ink text-airmail-cream hover:bg-airmail-red transition-colors flex items-center justify-center gap-1"
              >
                <span>⬇</span> UNDUH
              </button>
            </div>
          </div>
        </div>

        <div class="text-center">
          <NuxtLink to="/" class="font-courier text-xs text-airmail-tan hover:text-airmail-stamp tracking-widest underline">
            Kembali ke Beranda
          </NuxtLink>
        </div>
      </div>
    </div>

    <canvas ref="compositeCanvas" class="hidden"></canvas>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const route = useRoute()
const kode  = computed(() => route.params.kode)
const { getByKode } = useSesi()

const { data: sesiData, pending, error: fetchError } = await useAsyncData(
  'sesi-' + kode.value,
  () => getByKode(String(kode.value)),
  { watch: [kode] }
)

const hasilFrame = computed(() => {
  if (!sesiData.value || !sesiData.value.hasil_frame) return null
  return sesiData.value.hasil_frame[0] || null
})

const sortedFotos = computed(() => {
  if (!hasilFrame.value || !hasilFrame.value.foto_terpilih) return []
  return hasilFrame.value.foto_terpilih
    .slice()
    .sort(function(a, b) { return a.urutan_posisi - b.urutan_posisi })
})

const frameTemplateUrl = computed(() => hasilFrame.value?.master_frame?.file_template || null)
const cols = computed(() => hasilFrame.value?.master_frame?.layout_cols || 3)
const rows = computed(() => hasilFrame.value?.master_frame?.layout_rows || 2)

// ── Slot geometry — calibrated for RAFIKOSAN airmail frames ──
// Tweak these if photos don't align with frame slots
const SLOT_PAD_X  = 0.072   // left/right padding as fraction of frame width
const SLOT_PAD_YT = 0.155   // top padding
const SLOT_PAD_YB = 0.085   // bottom padding
const SLOT_GAP_X  = 0.018   // horizontal gap between slots
const SLOT_GAP_Y  = 0.018   // vertical gap between slots

const PREVIEW_W = 580
const frameContainerStyle = computed(() => {
  const ratio = rows.value / cols.value
  return { width: PREVIEW_W + 'px', height: Math.round(PREVIEW_W * ratio) + 'px', maxWidth: '100%' }
})

function getPhotoSlotStyle(idx) {
  const c = cols.value
  const r = rows.value
  const col = idx % c
  const row = Math.floor(idx / c)

  const usableW = 1 - SLOT_PAD_X * 2
  const usableH = 1 - SLOT_PAD_YT - SLOT_PAD_YB
  const slotW = (usableW - SLOT_GAP_X * (c - 1)) / c
  const slotH = (usableH - SLOT_GAP_Y * (r - 1)) / r

  const left   = SLOT_PAD_X  + col * (slotW + SLOT_GAP_X)
  const top    = SLOT_PAD_YT + row * (slotH + SLOT_GAP_Y)

  return {
    left:   (left   * 100) + '%',
    top:    (top    * 100) + '%',
    width:  (slotW  * 100) + '%',
    height: (slotH  * 100) + '%',
  }
}

const compositeCanvas = ref(null)
const framePreviewEl  = ref(null)
const downloading     = ref(false)
const downloadingAll  = ref(false)

// ── Download: composite photos onto frame PNG via Canvas ──────
async function downloadWithFrame() {
  downloading.value = true
  try {
    if (!frameTemplateUrl.value) {
      // No frame PNG — fallback to html2canvas
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(framePreviewEl.value, { useCORS: true, backgroundColor: '#F5EDD6', scale: 2 })
      triggerDownload(canvas.toDataURL('image/jpeg', 0.95), 'lemillion-frame-' + String(kode.value).slice(0, 8) + '.jpg')
      return
    }

    const framePng = await loadImage(frameTemplateUrl.value)
    const OUTPUT_W = framePng.naturalWidth  || 1200
    const OUTPUT_H = framePng.naturalHeight || 900

    const canvas = compositeCanvas.value
    canvas.width  = OUTPUT_W
    canvas.height = OUTPUT_H
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#F5EDD6'
    ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H)

    const c = cols.value
    const r = rows.value
    const usableW = OUTPUT_W - SLOT_PAD_X * 2 * OUTPUT_W
    const usableH = OUTPUT_H - (SLOT_PAD_YT + SLOT_PAD_YB) * OUTPUT_H
    const gapX    = SLOT_GAP_X * OUTPUT_W
    const gapY    = SLOT_GAP_Y * OUTPUT_H
    const slotW   = (usableW - gapX * (c - 1)) / c
    const slotH   = (usableH - gapY * (r - 1)) / r

    // Draw photos
    const fotos = sortedFotos.value
    for (let i = 0; i < fotos.length; i++) {
      const url = fotos[i].foto && fotos[i].foto.path_file
      if (!url) continue
      const col = i % c
      const row = Math.floor(i / c)
      const x = SLOT_PAD_X * OUTPUT_W + col * (slotW + gapX)
      const y = SLOT_PAD_YT * OUTPUT_H + row * (slotH + gapY)
      try {
        const img = await loadImage(url)
        const sa = img.naturalWidth / img.naturalHeight
        const da = slotW / slotH
        let sx, sy, sw, sh
        if (sa > da) { sh = img.naturalHeight; sw = sh * da; sx = (img.naturalWidth - sw) / 2; sy = 0 }
        else         { sw = img.naturalWidth; sh = sw / da; sx = 0; sy = (img.naturalHeight - sh) / 2 }
        ctx.drawImage(img, sx, sy, sw, sh, x, y, slotW, slotH)
      } catch (e) {
        ctx.fillStyle = '#D4B896'
        ctx.fillRect(x, y, slotW, slotH)
      }
    }

    // Draw frame PNG on top
    ctx.drawImage(framePng, 0, 0, OUTPUT_W, OUTPUT_H)

    triggerDownload(canvas.toDataURL('image/jpeg', 0.95), 'lemillion-frame-' + String(kode.value).slice(0, 8) + '.jpg')
  } catch (e) {
    console.error('[downloadWithFrame]', e)
    alert('Gagal membuat gambar. Coba klik kanan foto → Simpan gambar.')
  } finally {
    downloading.value = false
  }
}

async function downloadSinglePhoto(foto) {
  try {
    const res  = await fetch(foto.path_file)
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    triggerDownload(url, 'lemillion-foto-' + foto.id + '.jpg')
    URL.revokeObjectURL(url)
  } catch { window.open(foto.path_file, '_blank') }
}

async function downloadAllOriginal() {
  if (!sesiData.value || !sesiData.value.foto) return
  downloadingAll.value = true
  try {
    for (let i = 0; i < sesiData.value.foto.length; i++) {
      await downloadSinglePhoto(sesiData.value.foto[i])
      await new Promise(r => setTimeout(r, 500))
    }
  } finally { downloadingAll.value = false }
}

function printFrame() {
  if (!framePreviewEl.value) return
  const pw = window.open('', '_blank', 'width=900,height=700')
  pw.document.write(`<!DOCTYPE html><html><head><title>Print</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{display:flex;justify-content:center;align-items:center;min-height:100vh;}img{max-width:100%;}</style>
  </head><body>
    ${framePreviewEl.value.outerHTML}
    <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
  </body></html>`)
  pw.document.close()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function triggerDownload(url, filename) {
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
}
</script>
