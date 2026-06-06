<template>
  <div class="min-h-screen bg-gray-900 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-airmail-ink flex flex-col">
      <div class="p-6 border-b border-gray-700">
        <p class="font-display text-xs tracking-[0.25em] text-airmail-red uppercase">RAFIKOSAN</p>
        <p class="font-display text-lg text-airmail-cream tracking-widest">lemillion admin</p>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 rounded font-courier text-sm tracking-wider uppercase transition-colors"
          :class="$route.path === item.to
            ? 'bg-airmail-red text-white'
            : 'text-airmail-tan hover:bg-gray-700 hover:text-white'"
        >
          <span class="text-base">{{ item.icon }}</span>
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-700">
        <button @click="logout" class="w-full btn-outline text-airmail-cream border-airmail-tan hover:bg-airmail-red hover:border-airmail-red text-sm py-2">
          Keluar
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 bg-gray-50 overflow-auto pb-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const router = useRouter()
const navItems = [
  { to: '/admin',          icon: '📊', label: 'Dashboard' },
  { to: '/admin/pengaturan', icon: '⚙️', label: 'Pengaturan' },
  { to: '/admin/kode',     icon: '🎫', label: 'Kode Akses' },
  { to: '/admin/sesi',     icon: '📷', label: 'Sesi & Foto' },
  { to: '/admin/frame',    icon: '🖼️', label: 'Frame' },
]

function logout() {
  useCookie('admin_token').value = null
  router.push('/admin/login')
}
</script>
