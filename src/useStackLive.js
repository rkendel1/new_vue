/**
 * useStackLive — Vue 3 composable for the StackLive external app bridge.
 *
 * In a production project, replace this with:
 *   import { connectToStackLive } from '@stacklive/external-app-bridge';
 */

import { ref, onMounted, onUnmounted } from 'vue';

const SL_MSG_CONTEXT        = 'sl:context';
const SL_MSG_CONTEXT_UPDATE = 'sl:context:update';
const SL_MSG_TEARDOWN       = 'sl:teardown';
const SL_MSG_READY          = 'sl:ready';
const SL_MSG_EVENT          = 'sl:event';

/**
 * Vue composable for the StackLive external app bridge.
 *
 * @returns {{ context: Ref, connected: Ref<boolean>, tornDown: Ref<boolean>, emit: Function }}
 */
export function useStackLive() {
  const context   = ref(null);
  const connected = ref(false);
  const tornDown  = ref(false);

  function handleMessage(ev) {
    const { type, payload } = ev.data ?? {};
    if (type === SL_MSG_CONTEXT || type === SL_MSG_CONTEXT_UPDATE) {
      context.value   = payload ?? null;
      connected.value = true;
    } else if (type === SL_MSG_TEARDOWN) {
      connected.value = false;
      tornDown.value  = true;
    }
  }

  onMounted(() => {
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: SL_MSG_READY }, '*');
  });

  onUnmounted(() => {
    window.removeEventListener('message', handleMessage);
  });

  function emit(eventName, detail) {
    window.parent.postMessage(
      { type: SL_MSG_EVENT, payload: { event: eventName, detail } },
      '*',
    );
  }

  return { context, connected, tornDown, emit };
}
