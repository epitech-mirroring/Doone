import { defineStore } from 'pinia';

export type FullTeam = {
  id: string;
  name: string;
  organization: ListOrganization | null;
  users: (ListUser | null)[];
  owner: ListUser | null;
};

export type ListTeam = {
  id: string;
  name: string;
};

export type FullOrganization = {
  id: string;
  name: string;
  teams: (FullTeam | ListTeam | null)[];
  users: (ListUser | null)[];
  owner: ListUser | null;
};

export type ListOrganization = {
  id: string;
  name: string;
};

export const useOrganizationStore = defineStore('organization', () => {
  const organizations = ref<(ListOrganization | FullOrganization)[]>([]);
  const selectedOrganization = ref<FullOrganization | null>(null);

  async function fetchOrganizations() {
    const config = useRuntimeConfig();
    const userStore = useUserStore();
    
    const newOrganizations: (ListOrganization | FullOrganization)[] = [];
    for (const organization of userStore.me?.organizations || []) {
      const endpoint = config.public['apiBaseUrl'] + '/organizations/' + organization?.id;
      const response = await userStore.fetch(endpoint);
      const data = await response.json();
      newOrganizations.push(data);
    }
    
    if (selectedOrganization.value) {
      selectedOrganization.value = newOrganizations.find((org) => org.id === selectedOrganization.value?.id) as FullOrganization;
    } else {
      for (const organization of newOrganizations) {
        if ('teams' in organization) {
          selectedOrganization.value = organization;
          break;
        }
      }
    }
    organizations.value = newOrganizations;
  }

  function selectOrganization(organization: FullOrganization | string) {
    if (typeof organization === 'string') {
      selectedOrganization.value = organizations.value.find((org) => org.id === organization) as FullOrganization;
    } else {
      selectedOrganization.value = organization
    }
  }
  
  async function createOrganization(name: string) {
    const config = useRuntimeConfig();
    const userStore = useUserStore();
    const endpoint = config.public['apiBaseUrl'] + '/organizations';
    const response = await userStore.fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    organizations.value.push(data);
    selectOrganization(data);
  }

  return {
    organizations,
    selectedOrganization,
    fetchOrganizations,
    selectOrganization,
    createOrganization,
  };
}, { 
  persist: true
});
