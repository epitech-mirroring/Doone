<script setup lang="ts">
import { useUserStore } from '~/stores/userStore';
import DooneLogo from '~/components/DooneLogo.vue';
import {
  DropdownMenu,
  DropdownMenuShortcut,
} from '~/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '~/components/ui/command';
import { Popover } from '~/components/ui/popover';
import { cn } from '~/lib/utils';
import { DialogFooter, DialogHeader } from '~/components/ui/dialog';
import type { SmallTeam } from '~/stores/organizationStore';

const user = useUserStore();
const organizationStore = useOrganizationStore();
const router = useRouter();

const recentProjects = [
  {
    id: 1,
    name: "Project 1",
    organization: "Personal",
    starred: true,
  },
  {
    id: 2,
    name: "Project 2",
    organization: "Personal",
    starred: true,
  },
  {
    id: 3,
    name: "Project 3",
    organization: "Work",
    starred: false,
  },
  {
    id: 4,
    name: "Project 4",
    organization: "Work",
    starred: false,
  },
  {
    id: 5,
    name: "Project 5",
    organization: "Personal",
    starred: false,
  },
];

const starredOpen = ref(false);
const recentOpen = ref(false);

const showNewOrganizationDialog = ref(false);
const organizationOpen = ref(false);
const organizationNewOpen = ref(false);
const selectedOrganization = ref<Organization | null>(null);

onMounted(() => {
  selectedOrganization.value = organizationStore.organizations[0];
});
</script>

<template>
  <div>
    <div v-if="!user.getMe?.emailVerified" class="flex flex-row gap-2 w-screen h-10 bg-yellow-100 text-yellow-800 justify-center items-center">
      <p class="text-sm">
        Your email is not verified. Please verify your email address.
      </p>
      <Button variant="outline" size="sm" @click="router.push('dashboard/settings#verify')">Go to email verification</Button>
    </div>
    <nav class="flex justify-between items-center px-4 py-2 border-b-[1px] border-gray-200 bg-white">
      <div class="flex items-center justify-start space-x-4">
        <DooneLogo with-logo no-text size="md"/>
        <Dialog v-model:open="showNewOrganizationDialog">
          <Popover v-model:open="organizationOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="organizationOpen"
                aria-label="Select organization"
                :class="cn('w-[200px] justify-between', $attrs.class ?? '')"
                :disabled="organizationStore.organizations.length === 0"
              >
                <template v-if="organizationStore.organizations.length > 0">
                  <Avatar class="mr-2 h-5 w-5">
                    <AvatarImage
                      :src="`https://avatar.vercel.sh/${organizationStore.selectedTeam?.name}.png`"
                      :alt="organizationStore.selectedTeam?.name"
                    />
                  </Avatar>
                  {{ organizationStore.selectedTeam?.name }}
                </template>
                <template v-else>
                  <span class="text-gray-400">No Organization</span>
                </template>
                <i class="ml-auto h-4 w-4 shrink-0 opacity-50 fas fa-sort"/>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-[200px] p-0">
              <Command :filter-function="(list, term) => list.filter(i => (i as SmallTeam).name?.toLowerCase()?.includes(term)) as SmallTeam[]">
                <CommandList>
                  <CommandInput placeholder="Search team..." />
                  <CommandEmpty>No team found.</CommandEmpty>
                  <CommandGroup v-for="organization in organizationStore.organizations" :key="organization.id" :heading="organization.name">
                    <CommandItem
                      v-for="team in organization.teams"
                      :key="team.id"
                      :value="team"
                      class="text-sm"
                      @select="() => {
                  organizationStore.selectedTeam = team
                  organizationOpen = false
                }"
                    >
                      <Avatar class="mr-2 h-5 w-5">
                        <AvatarImage
                          :src="`https://avatar.vercel.sh/${team.name}.png`"
                          :alt="team.name"
                          :class="cn(organizationStore.selectedTeam?.id !== team.id ? 'grayscale' : '')"
                        />
                      </Avatar>
                      {{ team.name }}
                      <i
                        :class="cn('ml-auto h-4 w-4 fas fa-check',
                             organizationStore.selectedTeam?.id === team.id
                               ? 'opacity-100'
                               : 'opacity-0',
                  )"
                      />
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
                <CommandSeparator />
                <CommandList>
                  <CommandGroup>
                    <DialogTrigger as-child>
                      <CommandItem
                        value="create-team" @select="() => {
                    organizationOpen = false
                    showNewOrganizationDialog = true
                  }"
                      >
                        <i class="mr-2 fas fa-plus"/>
                        Create Team
                      </CommandItem>
                    </DialogTrigger>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create team</DialogTitle>
              <DialogDescription>
                Add a new team to manage projects and collaborate with your team members.
              </DialogDescription>
            </DialogHeader>
            <div>
              <div class="space-y-4 py-2 pb-4">
                <div class="space-y-2">
                  <Label for="organization">Organization</Label>
                  <Popover v-model:open="organizationNewOpen">
                    <PopoverTrigger as-child>
                      <Button
                        variant="outline"
                        role="combobox"
                        :aria-expanded="organizationNewOpen"
                        aria-label="Select organization"
                        class="w-full"
                      >
                        <template v-if="organizationStore.organizations.length > 0">
                          <Avatar class="mr-2 h-5 w-5">
                            <AvatarImage
                              :src="`https://avatar.vercel.sh/${selectedOrganization?.name}.png`"
                              :alt="selectedOrganization?.name"
                            />
                          </Avatar>
                          {{ selectedOrganization?.name }}
                          <i class="ml-auto h-4 w-4 shrink-0 opacity-50 fas fa-sort"/>
                        </template>
                        <template v-else>
                          <span class="text-gray-400">No Organization</span>
                        </template>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-[200px] p-0">
                      <Command :filter-function="(list, term) => list.filter(i => (i as Organization).name?.toLowerCase()?.includes(term)) as Organization[]">
                        <CommandList>
                          <CommandInput placeholder="Search organization..." />
                          <CommandEmpty>No organization found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              v-for="organization in organizationStore.organizations"
                              :key="organization.id"
                              :value="organization"
                              class="text-sm"
                              @select="() => {
                        selectedOrganization = organization
                        organizationNewOpen = false
                      }"
                            >
                              <Avatar class="mr-2 h-5 w-5">
                                <AvatarImage
                                  :src="`https://avatar.vercel.sh/${organization.name}.png`"
                                  :alt="organization.name"
                                  :class="cn(selectedOrganization?.id !== organization.id ? 'grayscale' : '')"
                                />
                              </Avatar>
                              {{ organization.name }}
                              <i
                                :class="cn('ml-auto h-4 w-4 fas fa-check',
                                     organizationStore.selectedTeam?.id === organization.id
                                       ? 'opacity-100'
                                       : 'opacity-0',
                      )"
                              />
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                        <CommandSeparator />
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div class="space-y-2">
                    <Label for="name">Team name</Label>
                    <Input id="name" placeholder="Doone Inc." />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" @click="showNewOrganizationDialog = false">
                  Cancel
                </Button>
                <Button type="submit">
                  Continue
                </Button>
              </DialogFooter>
            </div></DialogContent>
        </Dialog>
        <DropdownMenu @update:open="(isOpen) => recentOpen = isOpen">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost">
              Recent
              <i v-if="recentOpen" class="fas fa-chevron-up ml-1 text-gray-400 text-sm"/>
              <i v-else class="fas fa-chevron-down ml-1 text-gray-400 text-sm"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56 ml-10" align="end">
            <DropdownMenuItem v-for="project in recentProjects" :key="project.id">
              <div class="h-10">
                <Avatar class="h-full w-12 rounded-sm">
                  <AvatarImage :src="'https://api.dicebear.com/9.x/glass/svg?seed=' + project.id" />
                </Avatar>
              </div>
              <div class="project-info">
                <p class="text-sm font-medium">{{ project.name }}</p>
                <p class="text-xs text-muted-foreground">{{ project.organization }}</p>
              </div>
              <DropdownMenuShortcut>
                <i v-if="project.starred" class="fas fa-star text-yellow-400 " @click="(e) => { e.stopPropagation(); project.starred = !project.starred }"/>
                <i v-else class="far fa-star text-gray-400" @click="(e) => { e.stopPropagation(); project.starred = !project.starred }"/>
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu @update:open="(isOpen) => starredOpen = isOpen">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost">
              Starred
              <i v-if="starredOpen" class="fas fa-chevron-up ml-1 text-gray-400 text-sm"/>
              <i v-else class="fas fa-chevron-down ml-1 text-gray-400 text-sm"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56 ml-10" align="end">
            <DropdownMenuItem v-for="project in recentProjects.filter((p) => p.starred)" :key="project.id">
              <div class="h-10">
                <Avatar class="h-full w-12 rounded-sm">
                  <AvatarImage :src="'https://api.dicebear.com/9.x/glass/svg?seed=' + project.id" />
                </Avatar>
              </div>
              <div class="project-info">
                <p class="text-sm font-medium">{{ project.name }}</p>
                <p class="text-xs text-muted-foreground">{{ project.organization }}</p>
              </div>
              <DropdownMenuShortcut>
                <i v-if="project.starred" class="fas fa-star text-yellow-400 " @click="(e) => { e.stopPropagation(); project.starred = !project.starred }"/>
                <i v-else class="far fa-star text-gray-400" @click="(e) => { e.stopPropagation(); project.starred = !project.starred }"/>
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="default" class="font-bold">New</Button>
      </div>
      <div class="flex items-center justify-end space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="relative h-8 w-8 rounded-full">
              <Avatar class="h-8 w-8">
                <AvatarImage :src="'https://api.dicebear.com/9.x/notionists/svg?scale=150&translateY=10&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&seed=' + user.getMe?.id" />
                <AvatarFallback :delay-ms="1000">
                  {{ user.getMe?.name[0] }}
                  {{ user.getMe?.name[1] }}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="end">
            <DropdownMenuLabel class="font-normal flex">
              <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium leading-none">
                  {{ user.getMe?.name }}
                </p>
                <p class="text-xs leading-none text-muted-foreground">
                  {{ user.getMe?.email }}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Billing
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>New Team</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-red-500 focus:text-red-700" @select="user.logout">
              Log out
              <DropdownMenuShortcut>⇧⌘L</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </nav>
    <main class="flex justify-center items-center h-screen bg-gray-100">
      <slot/>
    </main>
  </div>
</template>

<style scoped lang="scss">

</style>
