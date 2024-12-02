<script setup lang="ts">
import ShortcutManager from '~/components/ShortcutManager.vue';
</script>

<template>
  <ShortcutManager>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ShortcutManager>
</template>

<style>
@import "~/assets/css/tailwind.css";
</style>
