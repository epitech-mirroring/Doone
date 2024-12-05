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
  const selectedTeam = ref<SmallTeam | null>(null);

  async function fetchOrganizations() {
    const config = useRuntimeConfig();
    const user = useUserStore();
    const endpoint = config.public['API_BASE_URL'] + '/organizations/mine';
    const response = await user.fetch(endpoint, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }

    organizations.value = await response.json();

    selectedTeam.value = organizations.value[0]?.teams[0] ?? null;
  }

  function selectTeam(team: SmallTeam) {
    selectedTeam.value = team;
  }

  return {
    organizations,
    selectedTeam,
    fetchOrganizations,
    selectTeam,
  };
});
