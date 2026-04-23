/**
 * StackLive API Client Composable
 *
 * Vue 3 composable wrapper for the StackLive API client.
 */

import { readonly, ref } from 'vue';

export function createStackLiveClient(config) {
  const apiUrl = config.apiUrl || 'https://api.stacklive.dev/v1';
  const { apiKey, developerId } = config;

  async function request(endpoint, options = {}) {
    const url = `${apiUrl}${endpoint}`;
    
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${apiKey}`);
    headers.set('Content-Type', 'application/json');
    
    if (developerId) {
      headers.set('X-Developer-ID', developerId);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  return {
    get(endpoint, options) {
      return request(endpoint, { ...options, method: 'GET' });
    },
    post(endpoint, data, options) {
      return request(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    put(endpoint, data, options) {
      return request(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    delete(endpoint, options) {
      return request(endpoint, { ...options, method: 'DELETE' });
    },
    request,
  };
}

/**
 * Vue composable for StackLive API client
 */
export function useStackLiveAPI() {
  const apiKey = import.meta.env.VITE_STACKLIVE_API_KEY;
  const developerId = import.meta.env.VITE_STACKLIVE_DEVELOPER_ID;
  const apiUrl = import.meta.env.VITE_STACKLIVE_API_URL;

  if (!apiKey) {
    console.warn('[useStackLiveAPI] VITE_STACKLIVE_API_KEY not set. API calls will fail.');
  }

  const client = createStackLiveClient({ apiKey, developerId, apiUrl });

  return readonly(client);
}
