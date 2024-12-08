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

const route = useRoute();
const organizationStore = useOrganizationStore();
const router = useRouter();
</script>

<template>
  <div class="flex flex-row items-start justify-start h-full w-full relative">
    <template v-if="organizationStore.organizations.length === 0 || organizationStore.selectedOrganization === null">
      <div class="opacity-100 bg-black/10 backdrop-blur-sm w-screen h-full absolute left-0 top-0"/>
      <div class="w-full h-full flex items-center justify-center absolute">
        <div class="flex flex-col items-center justify-center gap-5">
          <DooneLogo size="lg" with-logo/>
          <span class="text-2xl font-semibold text-black">Welcome to Doone</span>
          <span class="text-lg text-gray-500">It seems you haven't created any organizations yet.</span>
          <Button @click="router.push('/organizations/create')">Create an organization</Button>
        </div>
        <div class="absolute bottom-5 left-5 flex flex-col gap-2">
          <span class="text-xs text-gray-500">If you think this is a mistake, please contact support.</span>
          <span class="text-sm text-gray-500">© {{ new Date().getFullYear() }} Doone. All rights reserved.</span>
        </div>
      </div>
    </template>
    <div class="h-fit w-fit pl-32 pt-14 flex flex-col justify-start">
      <div class="left-section">
        <div class="left-item" :class="route.name === 'dashboard' ? 'active' : ''">
          <i class="fas fa-home fa-fw"/>
          <span>Home</span>
        </div>
        <div class="left-item">
          <i class="fas fa-chart-kanban fa-fw"/>
          <span>Boards</span>
        </div>
        <div class="left-item">
          <i class="fas fa-square-dashed-circle-plus fa-fw"/>
          <span>Models</span>
        </div>
      </div>
      <Separator/>
      <div class="left-section">
        <span class="left-section-title">Teams</span>
        <div v-for="team in organizationStore.selectedOrganization?.teams" :key="team.id" class="left-item">
          <Avatar class="mr-2 h-5 w-5" shape="square">
            <AvatarImage
              :src="`https://avatar.vercel.sh/${team.name}.png`"
              :alt="team.name"
            />
          </Avatar>
          <span>{{ team.name }}</span>
        </div>
        <div class="left-action">
          <i class="fas fa-plus"/>
          <span>Create a team</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.left-section {
  @apply w-52 h-fit bg-gray-100;
  @apply flex flex-col items-start justify-start;
  @apply gap-2;

  .left-section-title {
    @apply w-full h-fit flex items-center justify-start;
    @apply px-3 gap-2 rounded-md;
    @apply text-gray-500 text-sm font-semibold;
  }

  .left-item {
    @apply w-full h-12 flex items-center justify-start;
    @apply px-5 gap-2 rounded-md;
    @apply cursor-pointer;
    @apply transition-all duration-300;
    @apply text-gray-500 text-sm;

    &:hover {
      @apply bg-gray-200;
    }

    &.active {
      @apply text-primary;
      @apply bg-primary bg-opacity-10;
    }
  }

  .left-action {
    @apply w-fit h-12 flex items-center justify-start;
    @apply pr-5 ml-5 gap-2 rounded-md;
    @apply cursor-pointer;
    @apply transition-all duration-200;
    @apply text-gray-500 text-sm;

    &:hover {
      @apply text-primary;
      @apply scale-105;
    }
  }
}
</style>
