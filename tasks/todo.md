# Task: Support React Migration & Fix Vite Proxy Error

- [ ] Investigate root causes of `ECONNREFUSED 127.0.0.1:8000` and `read ECONNRESET`
- [ ] Fix frontend `Dockerfile` and build context (missing `public` directory, build stages)
- [ ] Update `docker-compose.yml` (remove obsolete `version` attribute, verify container health & port mappings)
- [ ] Configure Vite proxy robustly in `vite.config.js` (proper target fallback, error handling so proxy doesn't crash or throw noisy uncaught ECONNRESET, configure timeout and headers)
- [ ] Check environment variables and config files (`.env`, `.env.example`, `frontend/.env.example`)
- [ ] Verify API health checks and CORS compatibility between React frontend & FastAPI backend
- [ ] Update `README.md` and `frontend/README.md` (remove obsolete HTML/CSS/JS references, document React + Vite workflows and Docker Compose)
- [ ] Run automated tests and end-to-end verification (frontend tests, build, backend health, Docker build and run)
