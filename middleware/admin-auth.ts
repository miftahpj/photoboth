// middleware/admin-auth.ts
export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return // Skip on SSR

  const token = useCookie('admin_token')
  if (!token.value) {
    return navigateTo('/admin/login')
  }
})
