<script setup lang="ts">

type Modifier = 'ctrl' | 'shift' | 'alt' | 'meta';
type Shortcut = {
  keys: string[];
  modifiers?: Modifier[];
  handler: () => void;
};
const keyDown = ref<string[]>([]);
const modifiersDown = ref<Record<Modifier, boolean>>({
  ctrl: false,
  shift: false,
  alt: false,
  meta: false,
});

const user = useUserStore();

const reset = () => {
  keyDown.value = [];
  modifiersDown.value = {
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
  };
};

const shortcuts: Shortcut[] = [
  {
    keys: ['l'],
    modifiers: ['shift', 'meta'],
    handler: () => {
      if (user.isLoggedIn)
        user.logout();
    },
  }
];

const processShortcuts = (e: KeyboardEvent) => {
  for (const shortcut of shortcuts) {
    for (const key of shortcut.keys) {
      if (!keyDown.value.includes(key)) return;
    }
    if (shortcut.modifiers) {
      for (const modifier of shortcut.modifiers) {
        if (!modifiersDown.value[modifier]) return;
      }
    }
    shortcut.handler();
    reset();
    e.preventDefault();
  }
};

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (!(e.key === 'Meta' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Control')) {
      if (!keyDown.value.includes(e.key.toLowerCase())) {
        keyDown.value.push(e.key.toLowerCase());
      }
    }
    if (e.ctrlKey) modifiersDown.value.ctrl = true;
    if (e.shiftKey) modifiersDown.value.shift = true;
    if (e.altKey) modifiersDown.value.alt = true;
    if (e.metaKey) modifiersDown.value.meta = true;
    processShortcuts(e);
  });

  document.addEventListener('keyup', (e) => {
    if (!(e.key === 'Meta' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Control')) {
      while (keyDown.value.includes(e.key.toLowerCase())) {
        keyDown.value.splice(keyDown.value.indexOf(e.key.toLowerCase()), 1);
      }
    }
    if (!e.ctrlKey) modifiersDown.value.ctrl = false;
    if (!e.shiftKey) modifiersDown.value.shift = false;
    if (!e.altKey) modifiersDown.value.alt = false;
    if (!e.metaKey) modifiersDown.value.meta = false;
  });
});
</script>

<template>
  <div id="shortcut-manager">
    <slot />
  </div>
</template>

<style scoped lang="scss">

</style>
