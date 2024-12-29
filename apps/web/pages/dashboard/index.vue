<script setup lang="ts">
  import type { FullUser } from '~/stores/userStore';

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
const userStore = useUserStore();
const router = useRouter();

const t = computed(() => {
  return parseInt(route.query.t as string) || 0;
});

const temporaryUser = ref<FullUser | null>(null);

onMounted(() => {
  if (userStore.me) {
    temporaryUser.value = { ...userStore.me };
  }
});

const resetChanges = () => {
  temporaryUser.value = { ...userStore.me } as FullUser;
};
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
    <Dialog
      :open="t !== 0" 
      @update:open="val => {
        val ? null : router.push({name: route.name, params: route.params, query: {...route.query, ['t']: undefined}})
        val ? null : resetChanges()
      }">
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
          <div v-for="team in organizationStore.selectedOrganization?.teams" :key="team?.id" class="left-item">
            <Avatar class="mr-2 h-5 w-5" shape="square">
              <GradientImage :seed="team?.id"/>
            </Avatar>
            <span>{{ team?.name }}</span>
          </div>
          <div class="left-action">
            <i class="fas fa-plus"/>
            <span>Create a team</span>
          </div>
        </div>
      </div>
      <DialogContent as-child>
        <div id="dialog">
          <DialogHeader class="border-b border-gray-200 flex flex-row justify-start items-start h-fit">
            <div class="flex h-full items-center justify-start gap-2 bg-gray-50 p-4 w-52 flex-shrink-0 border-r border-gray-200">
              <span>Settings</span>
            </div>
            <div class="flex h-full w-full items-center justify-end p-4">
              <DialogClose>
                <i class="fas fa-times text-gray-500"/>
              </DialogClose>
            </div>
          </DialogHeader>
          <div class="w-full h-full flex flex-row items-start justify-start">
            <div class="left-section w-52">
              <div class="left-item" :class="t === 3537 ? 'active' : ''" @click="router.push({name: 'dashboard', query: {t: 3537}})">
                <i class="fas fa-address-card fa-fw"/>
                <span>Profile</span>
              </div>
              <div class="left-item" :class="t === 4321 ? 'active' : ''" @click="router.push({name: 'dashboard', query: {t: 4321}})">
                <i class="fas fa-cog fa-fw"/>
                <span>Settings</span>
              </div>
              <div class="left-item" :class="t === 4540 ? 'active' : ''" @click="router.push({name: 'dashboard', query: {t: 4540}})">
                <i class="fas fa-money-bill-wave fa-fw"/>
                <span>Billing</span>
              </div>
            </div>
            <div id="dialog-content">
              <template v-if="t === 3537">
                <div class="flex flex-col gap-4 w-full">
                  <div class="flex flex-col gap-2 w-full">
                    <span class="text-lg font-semibold text-black whitespace-nowrap">Profile picture</span>
                    <div class="flex flex-row items-center justify-start gap-5">
                      <Avatar class="h-20 w-20" shape="circle">
                        <AvatarImage :src="'https://api.dicebear.com/9.x/notionists/svg?scale=150&translateY=10&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&seed=' + userStore.me?.id" />
                        <AvatarFallback :delay-ms="1000">
                          {{ userStore.me?.name[0] }}
                          {{ userStore.me?.name[1] }}
                        </AvatarFallback>
                      </Avatar>
                      <div class="flex flex-row gap-4">
                        <Button variant="default" size="sm">Change picture</Button>
                        <Button variant="destructive" size="sm">Remove picture</Button>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2 w-full">
                    <span class="text-lg font-semibold text-black whitespace-nowrap">Name</span>
                    <div class="flex flex-row items-center justify-start gap-5 w-full">
                      <Input v-model="temporaryUser!.name" placeholder="Name" class="w-full" />
                    </div>
                  </div>

                  <div class="flex flex-col gap-2 w-full">
                    <span class="text-lg font-semibold text-black whitespace-nowrap">Email</span>
                    <div class="flex flex-row items-center justify-start gap-5 w-full">
                      <Input v-model="temporaryUser!.email" placeholder="Name" accept="email" class="w-full" />
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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

#dialog {
  @apply p-0 gap-0 overflow-hidden min-w-[50vw] w-full h-[80vh];
  @apply flex flex-col;
  
  .left-section {
    @apply h-full bg-gray-50;
    @apply flex flex-shrink-0 flex-col items-start justify-start;
    @apply gap-0;
    @apply border-r border-gray-200;
    
    .left-item {
      @apply w-full h-12 flex items-center justify-start;
      @apply px-5 gap-2 rounded-none;
      @apply cursor-pointer;
      @apply transition-all duration-300;

      &:hover {
        @apply bg-gray-200;
      }
      
      i {
        @apply text-gray-400;
      }
      
      span {
        @apply text-black font-medium;
      }
      
      &.active {
        @apply bg-primary bg-opacity-10;
        @apply border-r-2 border-primary;
      }
    }
  }
  
  #dialog-content {
    @apply w-full h-full;
    @apply px-5 pt-2;
  }
}
</style>
