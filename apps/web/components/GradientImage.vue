<script setup lang="ts">

const { seed, size = 120, rounded = 0, text } = defineProps<{ seed?: string; size?: number; rounded?: number, text?: string}>()
const gradient = ref<{fromColor: string, toColor: string}>({
  fromColor: "#ccf906",
  toColor: "#06ccf9",
})

watchEffect(async () => {
    gradient.value = await generateGradient(seed || Math.random() + "");
})

</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g> 
      <defs>
        <linearGradient :id="'gradient-' + seed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="gradient.fromColor" />
          <stop offset="100%" :stop-color="gradient.toColor" />
        </linearGradient>
      </defs>
      <rect :fill="'url(#gradient-' + seed +  ')'" x="0" y="0" :width="size" :height="size" :rx="rounded" :ry="rounded" />
      <text
        v-if="text"
        x="50%"
        y="50%"
        alignment-baseline="central" 
        dominant-baseline="central"
        text-anchor="middle"
        fill="#fff" 
        font-family="sans-serif"
        :font-size="(size * 0.9) / text.length"
      >
        {{ text }}
      </text>
      )}
    </g>
  </svg>
</template>

<style scoped lang="scss">

</style>
