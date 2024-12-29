export default defineNuxtPlugin(() => {
  const router = useRouter()

  if (process.env.NODE_ENV === 'development') {
    // Mode 1
    router.onError((error) => {
      console.error("plugin error:", error)
      if (error.message.includes('Failed to fetch dynamically imported module')) {
        window.location.reload()
      }
    })

    /*
    // Mode 2
    context.hook('app:chunkError', () => {
      window.location.reload()
    })
    */

    /*
    // Mode 3
    context.hook('app:error', (error) => {
      if (error.message.includes('Loading chunk')) {
        window.location.reload()
      }
    })
    */
  }
})
