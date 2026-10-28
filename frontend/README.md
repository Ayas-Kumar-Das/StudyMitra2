# StudyMitra frontend

React + Vite, Manrope, Phosphor icons. Backend source is unchanged.

## Run locally

From this folder:

```bash
npm ci
npm run dev
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001). Default `npm run dev` uses port 3001 so it can coexist with the Docker Compose frontend running on port 3000. If you wish to run on port 3000, specify `npm run dev -- --port 3000`.

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
## Workspace layout and backend flow

The app owns one viewport. The chat main area has four rows: heading, study toolbar, scrollable conversation/welcome, and composer. The composer stays visible while answers scroll. On phones the floating navigation moves to a bottom dock. Focus mode collapses desktop navigation while keeping chat, library, new chat and history available. Theme/focus changes use a bounded View Transition when supported; reduced-motion users get an immediate change.

- `src/components/Navigation.jsx` — floating navigation, compact rail and phone dock
- `src/styles/workspace.css` — authoritative viewport layout and glass treatment, loaded after shared `app.css`
- `src/features/LibraryBrowser.jsx` — semester → subject → category → document navigation
- `src/features/DocumentCard.jsx` — unchanged document preview, deletion and reindex actions
- `src/lib/library.js` — pure grouping over actual metadata, with unassigned buckets
- `src/lib/transitions.js` — whole-workspace transitions with a reduced-motion fallback

Backend source and deployment configuration are unchanged by this layout update. Upload still posts the file and metadata to `/api/documents/upload`; indexing loads, chunks, embeds, writes vectors/metadata and updates document status. The UI reads `/api/documents` and groups its `semester`, `subject`, and `doc_type` fields locally. Original category strings, including existing values such as `notes`, remain unchanged when used as chat filters. The chat still posts `{ query, mode, filters, top_k }` to `/api/chat/stream` and handles `token`, `sources`, `error` and `done` events. AI output is never synthesized in offline mode.

Additional checks (app running on port 3000):

```powershell
node tests/workspace-check.mjs
node tests/dropdown-check.mjs
```

The workspace check uses isolated, explicitly mocked backend fixtures. It verifies viewport containment at eight sizes, welcome/composer visibility, role alignment, long-answer scrolling, hierarchy and missing metadata, raw API filter values, citations, dark/focus states and reduced motion. It does not claim to validate a live backend or model.
### Compact masthead and message controls

`components/Brand.jsx` keeps branding at the upper left on the shared page gradient. `components/Navigation.jsx` uses a centered 70dvh panel on desktop, a compact rail in focus mode, and the bottom dock on phones. The masthead consists of independent Focus/theme controls and a centered heading; it has no full-width bar or connection-status label. Upload remains in the library and welcome flow.

`components/StudyModes.jsx` measures the selected study button and moves a single glass indicator across the panel, in either theme. `features/Composer.jsx` exposes an Expand/Shrink message box control. Both motions honor reduced-motion preferences. Unapproved logo concepts are kept outside the shipping app.
### Resources and uploading

`features/UploadPanel.jsx` is a separate, compact view within the library. Selecting Add materials replaces the resource browser instead of appending a form above it. The Resources button returns to the semester/subject/category browser. Counts, search, filters and existing document cards are not mounted underneath the upload form. The default form fits one viewport, using a split layout on desktop and two-column metadata on phones; its optional description opens in place.

`node tests/resources-upload-check.mjs` verifies aligned controls, removed bento decoration, upload containment at seven sizes, description and metadata persistence, local saving, Resources navigation and dark mode. Backend endpoints and payload field names are unchanged.
