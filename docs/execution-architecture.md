# Judgo execution architecture

> Judgo separates the application layer from the untrusted code execution layer. The web application and APIs are deployed on Vercel, while submissions are processed asynchronously through a job queue by isolated execution workers. Each submission runs inside a disposable sandbox with resource limits. This architecture allows execution workers to scale horizontally without affecting the main application.

## Audit: architecture before this upgrade

The React client called two execution paths:

- `POST /api/compiler/run` executed user code synchronously inside the API request through `executeCode`, local `child_process.spawn`, or Judge0.
- `POST /api/submissions/submit` created a record and normally published a RabbitMQ message, but retained an `ALLOW_INLINE_JUDGE` fallback that executed code inside the API process in development.

The existing `judge-service` consumed RabbitMQ messages, loaded MongoDB testcases, and ran one hardened Docker container per testcase. It therefore recompiled compiled languages for every testcase. It saved only a coarse `COMPLETED` state. Runtime and memory came from GNU `time`/Docker when the worker path was used, but the client and dashboard still substituted hard-coded values when metrics were absent. Complexity analysis was a source-code structural heuristic but several UI paths presented default Big-O values.

Hidden testcases were removed by the public problem route and submission reads enforced ownership. However, legacy result records without an explicit visibility classification could not be safely distinguished from public results.

## New architecture

```text
Browser / Judgo UI (Vercel)
          |
          | authenticated HTTPS
          v
Judgo API (Vercel) -------------> MongoDB
          |                         submission + lifecycle + result
          | BullMQ job contains
          | submissionId only
          v
Redis / BullMQ
          |
          | competing consumers
          +--------------------+--------------------+
          v                    v                    v
Execution worker A       Execution worker B       Execution worker N
          |                    |                    |
          v                    v                    v
Disposable Docker       Disposable Docker       Disposable Docker
sandbox containers      sandbox containers      sandbox containers
```

The Vercel API does not import or call a compiler, language runtime, Docker client, `child_process`, or Judge0 from either Run or Submit. Both operations now persist a record, set `QUEUED`, enqueue its ID, and return HTTP `202`.

## Submission and Run flow

1. Authentication and per-route rate limiting run in the API.
2. The API validates the language, UTF-8 source byte size, custom-input byte size, problem availability, and per-user active-job limit.
3. A MongoDB submission is created with `mode=SUBMIT` or `mode=RUN` and `status=QUEUED`.
4. BullMQ receives a durable job containing only `submissionId`. Source, user identity, problem limits, expected output, and hidden inputs are not trusted from queue payloads.
5. A worker reloads the authoritative submission and problem from MongoDB.
6. `RUN` uses custom input or public examples only. `SUBMIT` uses public and hidden testcases.
7. The UI polls `GET /api/submissions/:id` and may also receive authenticated per-user Socket.IO updates.

## Persisted lifecycle

```text
QUEUED -> COMPILING -> RUNNING -> JUDGING -> ANALYZING -> FINALIZING
                                                        |
                                                        v
ACCEPTED | WRONG_ANSWER | RUNTIME_ERROR | TIME_LIMIT_EXCEEDED
MEMORY_LIMIT_EXCEEDED | COMPILATION_ERROR | SYSTEM_ERROR
```

Every transition is appended to `statusHistory`. An infrastructure retry returns the job to `QUEUED`; user-code verdicts are terminal and are never retried.

## Worker and judge engine

Workers are stateless BullMQ competing consumers. `WORKER_CONCURRENCY` controls parallel jobs in one process; replicas increase aggregate capacity without API changes.

For a job, the centralized `JudgeWorker`:

1. creates a unique host work directory;
2. creates the language-specific complete program once;
3. runs one real compilation/syntax-check container;
4. stops immediately on compilation failure;
5. runs each testcase in a new disposable execution container using the compiled artifact;
6. compares actual stdout with expected output server-side;
7. calculates the verdict, maximum testcase runtime, total runtime, and maximum peak RSS;
8. analyzes the submitted source (not measured runtime) for complexity;
9. persists the result and removes the temporary directory.

Supported toolchains in the prebuilt sandbox image are GCC C17, G++ C++20, OpenJDK 21, Python 3, and Node.js. Compiler/runtime versions and compilation duration are captured from the installed tools. Python uses `py_compile`; JavaScript uses `node --check`.

## Sandbox security model

The trusted worker talks to the local Docker daemon. The daemon is never exposed publicly and the Docker socket is never mounted into a user-code container. Each compile or execute container has:

- a numeric non-root user;
- no network (`NetworkMode=none`);
- all Linux capabilities dropped and `no-new-privileges`;
- a read-only root filesystem;
- only the unique job directory mounted read/write;
- CPU, memory/swap, PID, open-file, created-file, output, and wall-clock limits;
- an in-memory `/tmp` with `nosuid`, `nodev`, and `noexec`;
- forced kill on the outer deadline and unconditional container deletion.

No API/worker environment variables are passed into user containers. Database credentials, JWT keys, service secrets, the host filesystem, internal networks, and the Docker socket are therefore absent from the sandbox.

The Compose file mounts the Docker socket only into the trusted worker service so it can create sibling sandboxes. A stronger production deployment can replace Docker with gVisor, Firecracker, Kata Containers, or a dedicated sandbox node pool.

## Hidden testcase protection

- Public problem routes remove `hiddenTestCases`, judge configuration, and solutions.
- Queue messages contain no testcase data.
- Workers load hidden cases internally and mark every result `PUBLIC` or `HIDDEN`.
- User-facing serializers include input, expected output, stdout, and diagnostics only for public cases. A hidden result contains only its number, verdict/status, runtime, memory, and visibility.
- Legacy results without an explicit visibility marker are treated as hidden (fail closed).
- Submission reads require the owner or an administrator.

## Runtime and memory measurement

Compilation and execution use separate monotonic/high-resolution timestamps inside the Linux sandbox. Testcase execution time is reported in microseconds and stored as milliseconds. The aggregate `execution.timeMs` is the maximum testcase duration; `execution.totalTimeMs` is also retained.

GNU `time` records maximum resident set size for the actual program. Docker OOM state and container memory statistics provide a second signal. The result stores `peakMemoryBytes`; UI conversion to MB is display formatting only. Measured peak memory is not presented as space complexity.

## Complexity analysis

Complexity is derived from the actual submitted source, never from elapsed time. The deterministic analyzer strips comments/strings and examines language-aware loop nesting, loop stride, recursion, sorting/searching/heap calls, and common allocations/collections. It reports `time`, `space`, `confidence`, an explanation, and a structural breakdown.

This is a conservative static analyzer, not a proof system. Input-dependent `while` loops, reflection/eval, deeply dynamic behavior, or highly complex source return `Unable to determine reliably` with low confidence. AI review remains a separate explanatory feature and is not allowed to overwrite measured execution facts or promote a low-confidence static result.

## Retries and failure isolation

BullMQ retries thrown infrastructure failures with configurable exponential backoff. Examples are Redis interruption, worker termination, Docker unavailability, and sandbox creation failure. Compilation error, wrong answer, runtime error, timeout, and memory limit are successful judge outcomes and complete the job without retry. After attempts are exhausted, the submission becomes `SYSTEM_ERROR`.

A stuck or malicious program can consume only its container allocation. Killing that container does not terminate the worker, API, Redis, database, or other concurrent containers.

## Scaling and deployment

Deploy the SPA/API to Vercel using the existing `vercel.json`. `.vercelignore` excludes the worker and infrastructure files, so Vercel receives no execution service.

Deploy Redis, MongoDB, realtime, and one or more trusted workers outside Vercel. Workers need access to a private Docker daemon and the prebuilt `online-judge-sandbox:latest` image. Keep Redis, MongoDB, worker monitoring, realtime internal broadcast, and Docker endpoints on private networks. Use TLS Redis (`rediss://`) and managed MongoDB in production.

Scale with replicas, for example:

```bash
docker compose up --build --scale worker=3
```

Do not share local worker memory as execution state. MongoDB and BullMQ remain authoritative, so worker replacement and horizontal scaling do not change the API.

## Local development

Copy `.env.example` to `.env`, provide the three secrets, then:

```bash
docker build -t online-judge-sandbox:latest judge-service/infra/docker
docker compose up --build
```

The UI is on `http://localhost:8080`, API on `4000`, realtime on `4001`, and authenticated worker health on `4002` through the API health aggregator.

On Windows, Docker Desktop exposes a named pipe rather than `/var/run/docker.sock`. Run Redis/Mongo/API in Compose and start `npm run dev:judge` on the Windows host, or use a Linux/WSL worker environment. Production workers should run on Linux.

## Required configuration

Core: `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, `REALTIME_JWT_SECRET`, and `REALTIME_INTERNAL_SECRET`.

Execution: `WORKER_CONCURRENCY`, `MAX_EXECUTION_TIME_MS`, `MAX_COMPILATION_TIME_MS`, `MAX_MEMORY_MB`, `MAX_OUTPUT_BYTES`, `MAX_SOURCE_SIZE_BYTES`, `MAX_CUSTOM_INPUT_SIZE_BYTES`, `MAX_CONCURRENT_JOBS_PER_USER`, `JOB_MAX_ATTEMPTS`, and `JOB_RETRY_DELAY_MS`.

Service routing: `REALTIME_SERVICE_URL`, `EXECUTION_SERVICE_URL`, and `EXECUTION_SERVICE_TOKEN`.

## Known limitations

- Docker provides process/container isolation, but it is not as strong as a microVM boundary. High-risk public deployments should use gVisor/Firecracker/Kata and dedicated worker nodes.
- The structural complexity analyzer recognizes common patterns but cannot prove Big-O for arbitrary programs. It explicitly lowers confidence rather than inventing an answer.
- The per-user concurrency check is database-backed and can admit a small race under simultaneous API requests. A production hard cap can add a Redis Lua semaphore keyed by user.
- A compilation container and each testcase container share only that submission's temporary directory. This makes compilation reusable while retaining per-test execution isolation, but container startup contributes operational overhead outside the reported in-program runtime.
- Local seed problems are available to the worker for development. Production problem/testcase administration should use MongoDB as the sole authoritative source.
- Some domain-specific seeded problem adapters currently provide LeetCode-style function harnesses only for Python and JavaScript. Until equivalent adapters are added, C, C++, and Java submissions for those problems must provide a complete stdin/stdout program.
