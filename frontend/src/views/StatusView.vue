<template>
  <section class="card panel status-panel">
    <div class="panel-head">
      <div>
        <h2>System Status</h2>
        <p class="muted">Explain storage availability, diagnostics, and how to self-check errors.</p>
      </div>
      <button class="btn btn-ghost" @click="loadStatus" :disabled="loading">
        {{ loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <div class="adapter-grid">
      <article v-for="item in adapters" :key="item.type" class="adapter-card">
        <div class="adapter-card-top">
          <strong>{{ item.label }}</strong>
          <span class="badge" :class="item.connected ? 'badge-ok' : 'badge-danger'">
            {{ item.connected ? 'Connected' : 'Unavailable' }}
          </span>
        </div>
        <p class="muted">{{ item.message }}</p>
        <p class="muted">Configured: {{ item.configured ? 'Yes' : 'No' }} | Layer: {{ item.layer }}</p>
        <p v-if="item.errorMessage" class="error">{{ item.errorMessage }}</p>
      </article>
    </div>

    <section class="card-lite diagnostic-card" v-if="telegramDiag">
      <h3>Telegram Diagnostics</h3>
      <p class="muted">{{ telegramDiag.summary }}</p>
      <ul class="diag-list">
        <li><strong>Config source:</strong> {{ telegramDiag.configSource || 'unknown' }}</li>
        <li><strong>Bot token source:</strong> {{ telegramDiag.tokenSource || 'not found' }}</li>
        <li><strong>Chat ID source:</strong> {{ telegramDiag.chatIdSource || 'not found' }}</li>
        <li><strong>API base source:</strong> {{ telegramDiag.apiBaseSource || 'default' }}</li>
      </ul>
      <ol class="diag-steps">
        <li>Call `/api/status` and verify Telegram `message` and `errorModel.detail` fields.</li>
        <li>Check Docker env values for the effective aliases shown above.</li>
        <li>If token/chat is valid but still timeout, inspect VPS outbound network to Telegram API.</li>
      </ol>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { apiFetch } from '../api/client';

const loading = ref(false);
const error = ref('');
const status = ref(null);

const adapters = computed(() => {
  const source = status.value || {};
  const list = Array.isArray(source.capabilities) ? source.capabilities : [];
  return list.map((cap) => {
    const detail = source[cap.type] || {};
    const errorMessage = detail.errorModel?.detail || '';
    return {
      type: cap.type,
      label: cap.label,
      connected: Boolean(detail.connected),
      configured: Boolean(detail.configured),
      layer: cap.layer || detail.layer || 'direct',
      message: detail.message || cap.enableHint || 'No data',
      errorMessage,
    };
  });
});

const telegramDiag = computed(() => status.value?.diagnostics?.telegram || null);

onMounted(() => {
  void loadStatus();
});

async function loadStatus() {
  loading.value = true;
  error.value = '';
  try {
    status.value = await apiFetch('/api/status');
  } catch (err) {
    error.value = err.message || 'Failed to load status';
  } finally {
    loading.value = false;
  }
}
</script>
