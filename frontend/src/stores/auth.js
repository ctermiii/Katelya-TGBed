import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiFetch } from '../api/client';

export const useAuthStore = defineStore('auth', () => {
  const initialized = ref(false);
  const authRequired = ref(false);
  const authenticated = ref(false);
  const guestUpload = ref({ enabled: false, maxFileSize: 0, dailyLimit: 0 });

  const guestMode = computed(() => authRequired.value && !authenticated.value && guestUpload.value.enabled);

  async function refresh() {
    const data = await apiFetch('/api/auth/check');
    authRequired.value = Boolean(data.authRequired);
    authenticated.value = Boolean(data.authenticated);
    guestUpload.value = data.guestUpload || { enabled: false, maxFileSize: 0, dailyLimit: 0 };
    initialized.value = true;
    return data;
  }

  async function login(username, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    await refresh();
    return data;
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    await refresh();
  }

  return {
    initialized,
    authRequired,
    authenticated,
    guestUpload,
    guestMode,
    refresh,
    login,
    logout,
  };
});