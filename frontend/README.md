# StudyMitra frontend

React + Vite, Manrope, Phosphor icons. Backend source is unchanged.

## Run locally

From this folder:

```powershell
npm ci
npm run dev -- --port 3000
```

Open http://127.0.0.1:3000. Default `npm run dev` uses port 3001 so it can coexist with the original Docker frontend on 3000.

## Frontend-only mode

With no backend, the app enters **Local preview**. Upload PDF, Markdown, or text files up to 50 MB. Original files live in IndexedDB, metadata and chat history in localStorage. Preview, download, search, filter and remove local files. Clearing site data removes these files. AI answers are explicitly offline; no answers or citations are fabricated.

## Connect your friend's backend

Vite forwards `/api` to `http://127.0.0.1:8000`. To use a different backend, set `API_PROXY_TARGET` before starting Vite. No browser CORS change is needed through this proxy.

```powershell
$env:API_PROXY_TARGET='http://BACKEND_ADDRESS:8000'
npm run dev -- --port 3000
```

Click the connection status or **Reconnect**. Local documents remain local until you click **Index for AI** on each document. That uploads its original file and metadata, then removes the local duplicate only after success.

For a separate production API origin, set `VITE_API_BASE_URL` at build time (including `/api`); the backend must permit that origin. Default production builds use same-origin `/api`. Existing Docker Compose works with the updated multi-stage frontend Dockerfile and existing nginx proxy. Backend needs its own configuration and API credentials.

## Build and verify

```powershell
npm run build
npm test
node tests/visual-check.mjs
node tests/backend-check.mjs
```

Browser checks use installed Microsoft Edge via Playwright and a running app on port 3000. `backend-check.mjs` intercepts API calls with explicit test fixtures; it does not test a real model or backend. The tests use isolated browser contexts.

## Source map

- `src/App.jsx` — workspace state, navigation, server coordination and chat
- `src/features/` — library/upload, welcome tools, composer
- `src/components/` — accessible dialogs and shared controls
- `src/lib/` — API/SSE client, validation, persistence helpers, study mode definitions
- `src/styles/` — responsive layout, theme tokens, motion and focus rules
- `tests/` — parser/validation unit tests and browser smoke checks
- `legacy/` — preserved original HTML/CSS/JS for reference; not shipped
- `dist/` — generated production bundle; do not edit

Both themes and focus mode persist. Reduced-motion preferences are respected. Markdown is rendered without raw HTML execution. All six original answer modes, source excerpts, streaming, stop, history, filters, upload metadata, deletion and reindexing are retained. The existing backend has no original-file download endpoint, so server documents show metadata and answer citations; local files support full preview/download.
