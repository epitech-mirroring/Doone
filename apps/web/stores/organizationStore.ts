import { defineStore } from 'pinia';

export type SmallTeam = {
  id: string;
  name: string;
}

export type Organization = {
  id: string;
  name: string;
  teams: SmallTeam[];
};

export const useOrganizationStore = defineStore('organization', () => {
  const organizations = ref<Organization[]>([]);
  const selectedOrganization = ref<Organization | null>(null);

  async function fetchOrganizations() {
    const config = useRuntimeConfig();
    const user = useUserStore();
    const endpoint = config.public['apiBaseUrl'] + '/organizations/mine';
    const response = await user.fetch(endpoint, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }

    organizations.value = await response.json();

    if (organizations.value.length > 0) {
      selectedOrganization.value = organizations.value[0];
    }
  }

  function selectOrganization(organization: Organization) {
    selectedOrganization.value = organization;
  }

  return {
    organizations,
    selectedOrganization,
    fetchOrganizations,
    selectOrganization
  };
});
