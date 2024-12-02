<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | string;
    withLogo?: boolean;
    notTilted?: boolean;
    noText?: boolean;
    disableLink?: boolean;
  }>(),
  {
    size: 'lg',
    withLogo: false,
    notTilted: false,
    noText: false,
    disableLink: false,
  },
);

const textSizeClasses: Record<string, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

const logoSizeClasses: Record<string, string> = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const getSizeClass = () =>
  ['sm', 'md', 'lg'].includes(props.size)
    ? textSizeClasses[props.size]
    : props.size;

const getLogoSizeClass = () =>
  ['sm', 'md', 'lg'].includes(props.size)
    ? logoSizeClasses[props.size]
    : props.size;

const router = useRouter();
const user = useUserStore();

const onClick = () => {
  if (!props.disableLink) {
    if (user.isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  }
};
</script>

<template>
  <div id="doone-logo" @click="onClick">
    <img
      v-if="props.withLogo"
      src="~/public/logo.svg"
      alt="Doone Logo"
      :class="[
        getLogoSizeClass(),
        !props.notTilted && 'transform rotate-[10deg]',
      ]"
    >
    <div v-if="!props.noText" id="doone-text">
      <span :class="getSizeClass()">D</span>
      <span class="text-primary z-10" :class="getSizeClass()">o</span>
      <span class="text-secondary z-20" :class="getSizeClass()">o</span>
      <span :class="getSizeClass()">n</span>
      <span :class="getSizeClass()">e</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
#doone-logo {
  @apply items-center gap-3 w-fit inline-flex select-none;

  #doone-text {
    @apply flex items-center;

    span {
      @apply font-climate-crisis;
      @apply tracking-[-0.25rem];
      @apply relative;
    }
  }
}
</style>
