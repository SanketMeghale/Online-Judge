# Production deployment

Judgo is production-ready as a distributed deployment, not as a Vercel-only application. Vercel hosts the web app and queue-only API. MongoDB and Redis are managed services. The realtime service and trusted judge worker run on a dedicated Linux Docker host.

```text
Browser -> Vercel web/API -> MongoDB
                         -> Redis/BullMQ -> Linux judge worker -> isolated sandbox containers
Browser -> HTTPS/WSS reverse proxy -> realtime service <------+
```

The worker has control of the host Docker daemon and must be treated as host-root authority. Run it on a dedicated, patched VM; never place unrelated workloads on that host and never expose the Docker socket over TCP.

## 1. Provision dependencies

- Create a production MongoDB database with backups, restricted credentials, and network access limited to the API and worker.
- Create a Redis service with persistence and TLS. Use a `rediss://` URL. Plain `redis://` is accepted only when `ALLOW_INSECURE_REDIS=true` and traffic stays on a trusted private network.
- Provision a Linux VM with Docker Engine and the Compose plugin. Docker Desktop is only needed for local Windows development; production uses Docker Engine as a system service.
- Put an HTTPS reverse proxy or load balancer in front of the realtime service on local port `4001`. Port `4002` is bound to localhost for operator health checks and must not be public.

## 2. Create secrets

Generate separate values; do not reuse one secret for multiple purposes:

```bash
openssl rand -hex 32 # JWT_SECRET
openssl rand -hex 32 # REALTIME_JWT_SECRET
openssl rand -hex 32 # REALTIME_INTERNAL_SECRET
openssl rand -hex 32 # EXECUTION_SERVICE_TOKEN
```

Copy `.env.worker.example` to `.env.worker` on the Linux host and replace every placeholder. Restrict it with `chmod 600 .env.worker`. Do not commit it.

Set these variables in the Vercel Production environment:

```text
NODE_ENV=production
MONGODB_URI
REDIS_URL
JWT_SECRET
REALTIME_JWT_SECRET
REALTIME_INTERNAL_SECRET
REALTIME_SERVICE_URL=https://realtime.your-domain.example
CLIENT_ORIGIN=https://your-site.example
ENABLE_DEMO_USERS=false
```

The API determines whether a worker is registered through BullMQ, so Vercel does not need network access to worker port `4002`. Keep that protected monitoring endpoint local to the execution host.

The web build also needs its public API and realtime URL variables as required by the selected frontend hosting arrangement. Keep the browser, API, and cookie domain aligned where possible.

## 3. Build and start the execution host

Run from the repository root on Linux. Use immutable version tags in a registry for repeatable releases; `latest` is shown only as the local default.

```bash
cp .env.worker.example .env.worker
# edit .env.worker and replace every placeholder
WORKER_ENV_FILE=.env.worker ./scripts/deploy-worker.sh
```

The deployment script validates the configuration, builds the sandbox and service images, runs the MongoDB index migration, starts the stack, and waits for worker liveness. The equivalent individual commands remain useful for diagnosis.

The job directory is intentionally the same absolute path on the host and inside the trusted worker (`/var/lib/judgo/jobs`). This is required because the worker asks the host Docker daemon to bind that directory into each sandbox.

Verify liveness and authenticated readiness:

```bash
curl --fail http://127.0.0.1:4002/live
curl --fail -H "Authorization: Bearer $EXECUTION_SERVICE_TOKEN" http://127.0.0.1:4002/health
curl --fail http://127.0.0.1:4001/health
```

The worker refuses to start unless MongoDB, Redis, Docker, its sandbox image, secrets, and shared absolute job path are valid. Its readiness is healthy only when Docker, Redis, and the BullMQ listener are all online.

## 4. Migrate and deploy the API

Run the user search-index migration once against the production database before allowing registration traffic:

```bash
MONGODB_URI='mongodb+srv://...' npm --workspace apps/api run migrate:user-search-index
```

This replaces an older MongoDB text index whose language override conflicted with profile values such as `en-US`.

Deploy the Vercel project after all Production variables are present. The API now returns a sanitized `503` instead of starting with fallback secrets or in-memory persistence when required production configuration is missing.

Create the first administrator only through the existing bootstrap script with environment-provided credentials. Never enable demo users in production.

## 5. Release verification

Before each release:

```bash
npm ci
npm run test:api
npm --workspace judge-service test -- --runInBand
npm run build
docker compose -f docker-compose.worker.prod.yml config
```

Then submit one known-good solution and one intentionally wrong solution through the production UI. Confirm that each moves from `QUEUED` to a terminal verdict and that a worker restart does not lose queued jobs.

The public dependency smoke test can be repeated from any machine:

```bash
npm run verify:production -- https://your-site.example https://realtime.your-domain.example
```

## 6. Operations and rollback

- Alert on API `/health`, authenticated worker `/health`, Redis memory/evictions, MongoDB connections/storage, queue depth, failed jobs, and host disk usage.
- Retain worker and reverse-proxy logs centrally. Compose rotates local container logs, but it is not a long-term log store.
- Back up MongoDB and test restores. Redis contains durable work in flight, but MongoDB remains the submission system of record.
- Drain or stop accepting new submissions before disruptive worker maintenance. BullMQ retries interrupted jobs using stable submission job IDs.
- Roll back by restoring the previous immutable worker/realtime image tags and redeploying the previous Vercel build. Do not roll back the search index to the incompatible language override.
- Regularly patch the Linux host, Docker Engine, base Node images, sandbox compilers, and npm dependencies.
