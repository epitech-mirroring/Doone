<script setup lang="ts">
definePageMeta({
  title: 'Dashboard',
  description: 'Dashboard page',
  middleware: ["auth"],
  layout: "dashboard",
});

useSeoMeta({
  title: 'Doone | Dashboard',
  description: 'Manage your projects and collaborate with your team members',
});
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-3xl font-bold">Dashboard</h1>
    <p class="text-gray-500">Manage your projects and collaborate with your team members</p>
  </div>
</template>

<style scoped lang="scss">
</style>
