export default defineNuxtRouteMiddleware(async () => {
  const userStore = useUserStore();
  
  if (!userStore.isLoggedIn) {
    return navigateTo('/login');
  }

  if (userStore.me === null) {
    await userStore.updateMe();
  }
})
