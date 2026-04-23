<template>
  <div class="container">
    <div class="card">
      <h1>Vue 3 Reference App</h1>
      <h2>StackLive External App Bridge Demo</h2>
      <span :class="['badge', connected && !tornDown ? 'connected' : 'disconnected']">
        ⬤ {{ tornDown ? 'Torn Down' : connected ? 'Connected' : 'Disconnected' }}
      </span>
    </div>

    <div class="card">
      <h2>Context from StackLive</h2>
      <div v-for="[label, value] in contextFields" :key="label" class="field">
        <label>{{ label }}</label>
        <span class="value">{{ value ?? '—' }}</span>
      </div>
    </div>

    <div class="card">
      <h2>Emit an Event</h2>
      <button @click="handleEmit">Emit: user:action</button>
    </div>

    <div class="card">
      <h2>API Authentication</h2>
      <div class="field">
        <label>Status</label>
        <span class="value">{{ apiStatus }}</span>
      </div>
      <button @click="handleTestAPI">Test API Connection</button>
      <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.5rem;">
        Configure VITE_STACKLIVE_API_KEY in .env to enable API calls
      </p>
    </div>

    <div class="card">
      <h2>Event Log</h2>
      <div class="log" ref="logEl">
        <div v-for="(entry, i) in eventLog" :key="i" class="log-entry">{{ entry }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useStackLive } from './useStackLive';
import { useStackLiveAPI } from './useStackLiveAPI';

const { context, connected, tornDown, emit } = useStackLive();
const apiClient = useStackLiveAPI();
const eventLog = ref(['Waiting for bridge connection…']);
const logEl = ref(null);
const apiStatus = ref('Not tested');

const contextFields = computed(() => [
  ['User ID', context.value?.identity?.userId],
  ['Display Name', context.value?.identity?.displayName],
  ['Config', context.value?.config ? JSON.stringify(context.value.config, null, 2) : undefined],
]);

function addLog(msg) {
  eventLog.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight;
  });
}

watch(connected, (val) => {
  if (val) addLog('Context received from StackLive');
});

watch(tornDown, (val) => {
  if (val) addLog('StackLive teardown received');
});

function handleEmit() {
  emit('user:action', { timestamp: Date.now(), source: 'vue-demo' });
  addLog('Emitted event: user:action');
}

async function handleTestAPI() {
  apiStatus.value = 'Testing...';
  try {
    const result = await apiClient.get('/profile');
    apiStatus.value = `✅ API Connected: ${result.email || 'Success'}`;
    addLog('API call successful');
    
    // Update context with profile data
    if (result?.id || result?.email) {
      context.value = {
        ...context.value,
        identity: {
          userId: result.id,
          displayName: result.email,
        },
        config: {
          role: result.role,
          subdomain: result.subdomain,
          createdAt: result.createdAt,
        },
      };
      connected.value = true;
      addLog('Profile data loaded into context');
    }
  } catch (error) {
    apiStatus.value = `❌ API Error: ${error.message}`;
    addLog(`API call failed: ${error.message}`);
  }
}

addLog('Bridge initialized — waiting for host context…');
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 2rem auto; padding: 1.5rem; font-family: system-ui, sans-serif; color: #1e293b; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem; }
h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
h2 { font-size: 1rem; font-weight: 600; color: #64748b; margin-bottom: 1rem; }
.badge { display: inline-flex; align-items: center; gap: 0.25rem; border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 600; }
.badge.connected { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.badge.disconnected { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.field { margin-bottom: 0.75rem; }
label { display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
.value { display: block; font-size: 0.875rem; padding: 0.5rem; background: #f8fafc; border-radius: 0.375rem; border: 1px solid #e2e8f0; min-height: 2rem; word-break: break-all; white-space: pre-wrap; }
button { background: #6366f1; color: #fff; border: none; border-radius: 0.5rem; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
button:hover { background: #4f46e5; }
.log { font-family: monospace; font-size: 0.75rem; background: #0f172a; color: #94a3b8; border-radius: 0.5rem; padding: 1rem; max-height: 200px; overflow-y: auto; }
.log-entry { padding: 0.125rem 0; }
</style>
