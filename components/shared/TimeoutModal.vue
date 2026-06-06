<template>
  <div class="fixed inset-0 bg-airmail-ink/80 flex items-center justify-center z-50 p-4">
    <div class="paper-card border-4 border-airmail-red max-w-sm w-full p-8 text-center animate-stamp-in">

      <!-- Airmail stripe -->
      <div class="h-3 -mx-8 -mt-8 mb-6" style="background: repeating-linear-gradient(90deg, #C0392B 0px, #C0392B 10px, #fff 10px, #fff 20px, #1A3A6B 20px, #1A3A6B 30px);"></div>

      <div class="inline-block border-4 border-airmail-red px-4 py-2 mb-4 rotate-[-2deg]">
        <p class="font-display text-airmail-red text-xl tracking-[0.3em]">WAKTU HABIS!</p>
      </div>

      <p class="font-courier text-airmail-stamp text-sm mb-6">
        Sesi 10 menit Anda telah berakhir.<br>Apa yang ingin Anda lakukan?
      </p>

      <div class="space-y-3">
        <button @click="$emit('ekstensi')" class="btn-secondary w-full text-sm">
          ⏱️ TAMBAH 5 MENIT
        </button>
        <button @click="$emit('lanjut-frame')" class="btn-primary w-full text-sm">
          🖼️ LANJUT KE SESI FRAME
        </button>
        <button @click="$emit('batalkan')" class="btn-outline w-full text-xs">
          BATALKAN — SKIP KE FRAME
        </button>
      </div>

      <div class="h-3 -mx-8 -mb-8 mt-6" style="background: repeating-linear-gradient(90deg, #1A3A6B 0px, #1A3A6B 10px, #fff 10px, #fff 20px, #C0392B 20px, #C0392B 30px);"></div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['ekstensi', 'lanjut-frame', 'batalkan'])
</script>
