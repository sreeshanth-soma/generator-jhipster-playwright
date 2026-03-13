#!/usr/bin/env bash

set -euo pipefail

framework="${1:?Usage: verify-generated-app.sh <framework> <base-name> <blueprint-tarball> <app-dir>}"
base_name="${2:?Usage: verify-generated-app.sh <framework> <base-name> <blueprint-tarball> <app-dir>}"
blueprint_tarball="${3:?Usage: verify-generated-app.sh <framework> <base-name> <blueprint-tarball> <app-dir>}"
app_dir="${4:?Usage: verify-generated-app.sh <framework> <base-name> <blueprint-tarball> <app-dir>}"

case "${framework}" in
  react|angular)
    ;;
  *)
    echo "Unsupported framework: ${framework}" >&2
    exit 1
    ;;
esac

mkdir -p "${app_dir}"

run_quiet() {
  local log_file="${1:?Usage: run_quiet <log-file> <command> [args...]}"
  shift

  if ! "$@" >"${log_file}" 2>&1; then
    echo "Command failed: $*" >&2
    cat "${log_file}" >&2 || true
    return 1
  fi
}

cat > "${app_dir}/app.jdl" <<EOF
application {
  config {
    baseName ${base_name}
    applicationType monolith
    authenticationType jwt
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

run_quiet generation.log jhipster jdl app.jdl --blueprints playwright --skip-install --force --skip-git --no-insight

# Use the packaged blueprint artifact so CI verifies the publishable tarball.
npm pkg delete devDependencies.generator-jhipster-playwright
run_quiet npm-install.log env PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --save-dev "${blueprint_tarball}"
run_quiet playwright-install.log npx playwright install --with-deps chromium

./mvnw -Dskip.installnodenpm -Dskip.npm -ntp --batch-mode > backend.log 2>&1 &
backend_pid=$!

cleanup() {
  if kill -0 "${backend_pid}" >/dev/null 2>&1; then
    kill "${backend_pid}" >/dev/null 2>&1 || true
    wait "${backend_pid}" >/dev/null 2>&1 || true
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
