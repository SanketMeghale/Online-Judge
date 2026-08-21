# Online Judge

A monorepo for a coding-practice and contest application. The API records submissions and publishes BullMQ jobs to Redis; a dedicated execution worker runs them in locked-down Docker containers, stores verdicts, and sends authenticated realtime updates.

## Architecture

```text
React/Vite web app
        |
        | HTTPS, HttpOnly session cookie
        v
Express API  ---> MongoDB
        |
        | durable BullMQ job (submissionId only)
        v
Judge worker ---> isolated Docker sandbox
        |
        | authenticated internal event
        v
Socket.IO realtime service ---> submitting user only
```

The workspace contains:

- `apps/web`: React 19 and Vite client.
- `apps/api`: Express REST API, authentication, problem/contest data, and submission producer.
- `judge-service`: the only component allowed to execute submitted code. It supports C, C++, Java, JavaScript, and Python through the sandbox image.
- `services/realtime`: authenticated Socket.IO delivery for per-user submission updates.
- `packages/shared`: language, verdict, and queue contracts shared across services.

MongoDB and Redis are required for queued execution. Run and Submit never execute source inside the API process and there is no inline fallback.

## Security model

- Browser sessions use signed JWTs in HttpOnly cookies; tokens are not returned in response bodies or persisted in browser storage.
- Firebase identity tokens are verified against Google's public keys and the configured Firebase project.
- Hidden tests, reference solutions, judge output, and internal problem data are removed from public responses.
- Submission ownership comes from the authenticated user and is enforced on reads.
- Production judging fails closed if Redis or MongoDB is unavailable.
- Containers have no network or Linux capabilities, use a read-only root filesystem and non-root user, and enforce CPU, memory, process, file, timeout, and output limits.
- Realtime clients use a separate five-minute signing secret. Judge-to-realtime calls use a distinct internal service secret.

Docker is a security boundary here, but the host still needs normal hardening: keep Docker and the sandbox image patched, do not expose the Docker socket outside the judge worker, and run the worker separately from the public API.

## Local setup

Requirements: Node.js 20+, MongoDB, Redis, and Docker.

```bash
npm install
docker build -t online-judge-sandbox:latest judge-service/infra/docker
```

Copy `apps/api/.env.example` to the environment used by each service and replace every placeholder secret. At minimum, configure:

```text
JWT_SECRET
REALTIME_JWT_SECRET
REALTIME_INTERNAL_SECRET
REALTIME_SERVICE_URL
MONGODB_URI
REDIS_URL
CLIENT_ORIGIN
```

Start each process in a separate terminal:

```bash
npm run dev:web
npm run dev:api
npm run dev:realtime
npm run dev:judge
```

The default ports are web `8080`, API `4000`, realtime `4001`, and judge health monitoring `4002`.

## Verification

```bash
npm run test:api
npm --workspace judge-service test -- --runInBand
npm run build
npm audit --omit=dev
```

With Docker running, execute the real sandbox integration suite from PowerShell:

```powershell
$env:RUN_DOCKER_INTEGRATION="true"
npm --workspace judge-service test -- DockerIntegration.test.js --runInBand
```

## Deployment notes

The Vercel configuration can host the SPA and API, but Vercel cannot run Docker execution workers, Redis, or the persistent realtime service. Deploy those separately and configure their URLs and secrets. Prefer routing the browser to the API on the same site so the `SameSite=Lax` HttpOnly cookie works predictably.

Do not enable `ENABLE_DEMO_USERS` in production. Bootstrap the first administrator with `apps/api/src/scripts/bootstrapAdmin.js` and environment-provided credentials; the project contains no default production administrator password. Follow `docs/production-deployment.md` for the production checklist and `docs/execution-architecture.md` for the complete execution flow and limitations.
