<template>
  <div class="min-h-screen bg-airmail-ink flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

      <div class="text-center mb-8">
        <p class="font-display text-xs tracking-[0.3em] text-airmail-red uppercase mb-1">RAFIKOSAN</p>
        <h1 class="font-display text-3xl text-airmail-cream tracking-widest">ADMIN PANEL</h1>
        <p class="font-courier text-airmail-tan text-xs mt-1 tracking-widest">lemillion project</p>
      </div>

      <div class="bg-gray-800 border-2 border-gray-600 p-6">
        <div class="space-y-4 mb-6">
          <div>
            <label class="font-display text-xs tracking-widest text-airmail-tan uppercase block mb-2">Username</label>
            <input
              v-model="form.username"
              type="text"
              class="w-full bg-gray-900 border border-gray-600 text-airmail-cream font-courier px-3 py-2 focus:border-airmail-red outline-none text-sm tracking-widest"
              placeholder="admin"
              @keyup.enter="login"
            />
          </div>
          <div>
            <label class="font-display text-xs tracking-widest text-airmail-tan uppercase block mb-2">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="w-full bg-gray-900 border border-gray-600 text-airmail-cream font-courier px-3 py-2 focus:border-airmail-red outline-none text-sm"
              placeholder="••••••••"
              @keyup.enter="login"
            />
          </div>
        </div>

        <p v-if="error" class="font-courier text-xs text-airmail-red mb-3 tracking-wider">✗ {{ error }}</p>

        <button @click="login" :disabled="loading" class="btn-primary w-full text-sm">
          {{ loading ? 'Masuk...' : 'MASUK →' }}
        </button>
      </div>

      <p class="text-center mt-4">
        <NuxtLink to="/" class="font-courier text-xs text-airmail-tan hover:text-airmail-cream tracking-widest">
          ← Kembali ke Photobooth
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const router = useRouter()
const form   = reactive({ username: '', password: '' })
const error  = ref('')
const loading = ref(false)

// If already logged in, redirect
onMounted(() => {
  const token = useCookie('admin_token')
  if (token.value) router.replace('/admin')
})

async function login() {
  error.value = ''
  loading.value = true
  try {
    const res = await $fetch('/api/admin/login', {
      method: 'POST',
      body: { username: form.username, password: form.password },
    })
    if (res.token) {
      useCookie('admin_token', { maxAge: 60 * 60 * 8 }).value = res.token
      router.push('/admin')
    }
  } catch (e) {
    error.value = e.data?.message || 'Username atau password salah'
  } finally {
    loading.value = false
  }
}
</script>
