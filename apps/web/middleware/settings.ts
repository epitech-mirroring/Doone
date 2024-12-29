import { hash } from '~/utils/gradients';

export default defineNuxtRouteMiddleware(async (target) => {
  const to = target.name?.toString().replace('dashboard-', '');
  if (!to) return;
  const hashed = await hash(to);
  return navigateTo('/dashboard?t=' + hashed);
})
