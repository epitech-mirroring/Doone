import { defineStore } from 'pinia';
import posthog from 'posthog-js';
import type {
  FullOrganization,
  FullTeam,
  ListOrganization,
  ListTeam,
} from '~/stores/organizationStore';

export type FullUser = {
  id: string;
  email: string;
  name: string;
  organizations: (FullOrganization | ListOrganization | null)[];
  teams: (FullTeam | ListTeam | null)[];
  emailVerified: boolean;
};

export type ListUser = {
  id: string;
  name: string;
};

export const useUserStore = defineStore('user', () => {

  const _accessToken = ref<string | null>(null);
  const _refreshToken = ref<string | null>(null);
  const me = ref<FullUser | null>(null);
  const _rememberMe = ref<boolean>(false);

  const getAccessTokenContent = computed(() => {
    if (!_accessToken.value) return null;
    const payload = _accessToken.value.split('.')[1];
    return JSON.parse(atob(payload));
  });

  const isAccessTokenExpired = computed(() => {
    const content = getAccessTokenContent.value;
    if (!content) return true;
    return content.exp * 1000 < Date.now();
  })

  const isLoggedIn = computed(() => !!_accessToken.value && !isAccessTokenExpired.value);

  function setTokens(tokens: Partial<{ accessToken: string; refreshToken: string }>) {
    if (tokens.accessToken) {
      _accessToken.value = tokens.accessToken;
      me.value = null;
    }
    if (tokens.refreshToken) {
      _refreshToken.value = tokens.refreshToken;
    }
  }

   async function login(email: string, password: string): Promise<void> {
    const config = useRuntimeConfig();
    const endpoint = config.public['apiBaseUrl'] + '/auth/login';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid email or password');
    }

    const data = await response.json();

    if (!data.accessToken || !data.refreshToken) {
      throw new Error('Invalid response');
    }

    setTokens(data);
  }

  async function register(email: string, password: string, name: string): Promise<undefined | {
    error: string
    message: string
    statusCode: number
  }> {
    const config = useRuntimeConfig();
    const endpoint = config.public['apiBaseUrl'] + '/users/register';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      return await response.json();
    }

    const data = await response.json();

    if (!data.accessToken || !data.refreshToken) {
      throw new Error('Invalid response');
    }

    setTokens(data);
  }

  async function verify(code: number): Promise<undefined | {
    error: string
    message: string
    statusCode: number
  }> {
    const config = useRuntimeConfig();
    const endpoint = config.public['apiBaseUrl'] + '/users/verify';
    const response = await authFetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationCode: code }),
    });

    if (!response.ok) {
      return response.json();
    }
  }

  async function refresh(): Promise<void> {
    if (!_refreshToken.value) {
      throw new Error('No refresh token');
    }

    const config = useNuxtApp().$config;
    const endpoint = config.public['apiBaseUrl'] + '/auth/refresh';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: _refreshToken.value }),
    });

    if (!response.ok) {
      throw new Error('Invalid refresh token');
    }

    const data = await response.json();

    if (!data.accessToken) {
      throw new Error('Invalid response');
    }

    setTokens(data);
  }

  async function logout()  {
    _accessToken.value = null;
    _refreshToken.value = null;

    const router = useRouter();
    await router.push('/');
  }

  async function updateMe() {
    if (!isLoggedIn.value) {
      me.value = null;
      return;
    }

    const config = useRuntimeConfig();
    const endpoint = config.public['apiBaseUrl'] + '/users/me';
    await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${_accessToken.value}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Invalid response');
        }
        return response.json();
      })
      .then((data) => {
        posthog.identify(data.id, {
          email: data.email,
          name: data.name,
        });
        me.value = data;
      })
      .catch(() => {
        me.value = null;
      });
  }
  
  function setRememberMe(value: boolean) {
    _rememberMe.value = value;
  }

  function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    if (!init) {
      init = {};
    }
    if (!init.headers) {
      init.headers = {};
    }
    if (_accessToken.value) {
      (init.headers as Record<string, string>)['Authorization'] = `Bearer ${_accessToken.value}`;
    }
    return fetch(input, init);
  }

  return {
    accessToken: _accessToken,
    refreshToken: _refreshToken,
    isLoggedIn,
    setTokens,
    isAccessTokenExpired,
    login,
    logout,
    refresh,
    me,
    setRememberMe,
    updateMe,
    fetch: authFetch,
    register,
    verify,
  }
}, {
  persist: true,
});
