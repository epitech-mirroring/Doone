import { useOrganizationStore } from "~/stores/organizationStore";

export default defineNuxtRouteMiddleware(async () => {
  const userStore = useUserStore();
  const organizationStore = useOrganizationStore();


  if (!userStore.isLoggedIn) {
    return navigateTo('/login');
  }

  if (userStore.getMe === null) {
    await userStore.updateMe();
    await organizationStore.fetchOrganizations();
  }
})
