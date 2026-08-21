#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "This deployment script must run on the dedicated Linux judge host." >&2
  exit 1
fi

for command_name in curl docker git sudo; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command is missing: $command_name" >&2
    exit 1
  fi
done

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
worker_env_file="${WORKER_ENV_FILE:-$repository_root/.env.worker}"
compose_file="$repository_root/docker-compose.worker.prod.yml"

if [[ ! -f "$worker_env_file" ]]; then
  echo "Worker environment file not found: $worker_env_file" >&2
  echo "Copy .env.worker.example to .env.worker and replace every placeholder." >&2
  exit 1
fi

if grep -Eq '(^|=)(replace-with|USER:PASSWORD|HOST:PORT|judgo\.example)' "$worker_env_file"; then
  echo "The worker environment file still contains placeholder values." >&2
  exit 1
fi

chmod 600 "$worker_env_file"
sudo install -d -m 700 /var/lib/judgo/jobs

cd "$repository_root"
export WORKER_ENV_FILE="$worker_env_file"

docker compose -f "$compose_file" config --quiet
docker build -t online-judge-sandbox:latest judge-service/infra/docker
docker compose -f "$compose_file" build
docker compose -f "$compose_file" run --rm --no-deps worker \
  npm --workspace apps/api run migrate:user-search-index
docker compose -f "$compose_file" up -d --remove-orphans
docker compose -f "$compose_file" ps

for attempt in {1..20}; do
  if curl --fail --silent http://127.0.0.1:4002/live >/dev/null; then
    echo "Judge worker is live."
    exit 0
  fi
  sleep 2
done

echo "Judge worker did not become live. Inspect: docker compose -f $compose_file logs worker" >&2
exit 1
