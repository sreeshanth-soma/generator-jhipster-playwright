#!/usr/bin/env bash

set -euo pipefail

framework="${1:?Usage: verify-generated-app.sh <framework> <base-name> <blueprint-tarball> <app-dir> [auth-type]}"
base_name="${2:?Usage: verify-generated-app.sh <framework> <base-name> <blueprint-tarball> <app-dir> [auth-type]}"
blueprint_tarball="${3:?Usage: verify-generated-app.sh <framework> <base-name> <blueprint-tarball> <app-dir> [auth-type]}"
app_dir="${4:?Usage: verify-generated-app.sh <framework> <base-name> <blueprint-tarball> <app-dir> [auth-type]}"
auth_type="${5:-jwt}"

case "${framework}" in
  react|angular|vue)
    ;;
  *)
    echo "Unsupported framework: ${framework}" >&2
    exit 1
    ;;
esac

case "${auth_type}" in
  jwt|session|oauth2)
    ;;
  *)
    echo "Unsupported auth type: ${auth_type}" >&2
    exit 1
    ;;
esac

mkdir -p "${app_dir}"

cat > "${app_dir}/app.jdl" <<EOF
application {
  config {
    baseName ${base_name}
    applicationType monolith
    authenticationType ${auth_type}
    clientFramework ${framework}
    devDatabaseType h2Disk
    testFrameworks [cypress]
  }
  entities Blog, Tag
}

entity Blog {
  name String required
  handle String required minlength(2)
}

entity Tag {
  name String required minlength(2)
}

relationship ManyToMany {
  Blog{tag(name)} to Tag{blog}
}
EOF

cd "${app_dir}"

jhipster jdl app.jdl --blueprints playwright --skip-install --force --skip-git --no-insight 2>&1 | tee generation.log

# Use the packaged blueprint artifact so CI verifies the publishable tarball.
npm pkg delete devDependencies.generator-jhipster-playwright
env PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --save-dev "${blueprint_tarball}" 2>&1 | tee npm-install.log
npx playwright install --with-deps chromium 2>&1 | tee playwright-install.log

# OAuth2 requires Keycloak — start it before the backend
if [ "${auth_type}" = "oauth2" ]; then
  echo "Starting Keycloak for OAuth2..."
  docker compose -f src/main/docker/keycloak.yml up -d
  keycloak_ready=0
  for _ in {1..60}; do
    if curl -fsS http://127.0.0.1:9080/realms/jhipster >/dev/null 2>&1; then
      keycloak_ready=1
      break
    fi
    sleep 3
  done
  if [ "${keycloak_ready}" -ne 1 ]; then
    echo "Keycloak failed to start" >&2
    docker compose -f src/main/docker/keycloak.yml logs >&2 || true
    exit 1
  fi
  echo "Keycloak is ready"
fi

./mvnw -Dskip.installnodenpm -Dskip.npm -ntp --batch-mode > backend.log 2>&1 &
backend_pid=$!

cleanup() {
  if kill -0 "${backend_pid}" >/dev/null 2>&1; then
    kill "${backend_pid}" >/dev/null 2>&1 || true
    wait "${backend_pid}" >/dev/null 2>&1 || true
  fi
  if [ "${auth_type}" = "oauth2" ]; then
    docker compose -f src/main/docker/keycloak.yml down >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

ready=0
for _ in {1..90}; do
  if curl -fsS http://127.0.0.1:8080/management/health >/dev/null 2>&1; then
    ready=1
    break
  fi
  if ! kill -0 "${backend_pid}" >/dev/null 2>&1; then
    echo "Backend exited before becoming ready" >&2
    tail -n 200 backend.log >&2 || true
    exit 1
  fi
  sleep 2
done

if [ "${ready}" -ne 1 ]; then
  echo "Backend failed to start" >&2
  tail -n 200 backend.log || true
  exit 1
fi

npx playwright test
