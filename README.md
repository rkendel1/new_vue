# Vue 3 External App Reference

A Vue 3 + Vite reference implementation of a StackLive-integrated external app.

## Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

3. **Get your API credentials**
   - Visit https://stacklive.io/developer
   - Register as a developer
   - Create an app and copy the API key
   - Add to `.env`:
     ```
     VITE_STACKLIVE_DEVELOPER_ID=your_developer_id
     VITE_STACKLIVE_API_KEY=sl_test_your_api_key
     ```

4. **Run the dev server**
```bash
npm run dev
# → http://localhost:5173
```

## Key Files

| File | Description |
|------|-------------|
| `src/useStackLive.js` | Vue composable wrapping the bridge protocol |
| `src/useStackLiveAPI.js` | Vue composable for authenticated API calls |
| `src/App.vue` | Main component showing context, events, and API usage |
| `.env.example` | Template for environment variables |

## The `useStackLive` Composable

Manages the postMessage bridge connection:

```vue
<script setup>
import { useStackLive } from './useStackLive';

const { context, connected, emit } = useStackLive();

function sendAction() {
  emit('user:click', { target: 'cta' });
}
</script>

<template>
  <div>
    <p>Connected: {{ connected }}</p>
    <p>User: {{ context?.identity?.userId }}</p>
    <button @click="sendAction">Send Event</button>
  </div>
</template>
```

## The `useStackLiveAPI` Composable

Makes authenticated API calls to StackLive:

```vue
<script setup>
import { useStackLiveAPI } from './useStackLiveAPI';

const api = useStackLiveAPI();

async function fetchProfile() {
  const profile = await api.get('/profile');
  console.log(profile);
}

async function createEmbed() {
  const embed = await api.post('/embeds', {
    name: 'My Embed',
    type: 'external-app',
    config: { url: 'https://myapp.com' }
  });
  console.log(embed);
}
</script>

<template>
  <button @click="fetchProfile">Fetch Profile</button>
</template>
```

## Environment Variables

The app reads these from `.env`:

- `VITE_STACKLIVE_DEVELOPER_ID` - Your developer ID from the portal
- `VITE_STACKLIVE_API_KEY` - Your API key (sl_test_... or sl_live_...)
- `VITE_STACKLIVE_API_URL` - API base URL (defaults to production)
- `VITE_BRIDGE_ENABLED` - Enable bridge mode (optional)

## Production Usage

```bash
npm install @stacklive/external-app-bridge
```

```js
import { connectToStackLive } from '@stacklive/external-app-bridge';

const bridge = connectToStackLive();
bridge.onContext(({ identity, config }) => { /* ... */ });
bridge.emit('user:action', { detail: 'hello' });
```

## Security Notes

- Never commit `.env` to version control
- Use `sl_test_...` keys for development  
- Use `sl_live_...` keys only in production
- Store keys in Vercel/Netlify environment variables for deployment
