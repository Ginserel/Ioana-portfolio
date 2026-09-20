#!/usr/bin/env bash
# Checks what a stranger can actually reach, using the same publishable key
# that ships in the browser bundle. Run it from the project root after any
# change to policies:   ./supabase/check-rls.sh
#
# It reads .env only to avoid pasting credentials around, and never prints
# the key. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY yourself to
# check a different project.

set -uo pipefail

if [ -z "${VITE_SUPABASE_URL:-}" ] || [ -z "${VITE_SUPABASE_ANON_KEY:-}" ]; then
  if [ ! -f .env ]; then
    echo "No .env here. Run this from the project root, or set the two"
    echo "variables yourself first." >&2
    exit 1
  fi
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

url="${VITE_SUPABASE_URL%/}"

check() {
  local table="$1" want="$2" label="$3"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 \
    -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
    "${url}/rest/v1/${table}?select=id&limit=1")

  if [ "$code" = "000" ]; then
    printf '  %-9s could not reach the server (network or wrong URL)\n' "$table"
    return 1
  fi

  case "$want:$code" in
    blocked:401|blocked:403) printf '  %-9s %s  OK - %s\n' "$table" "$code" "$label" ;;
    readable:200)            printf '  %-9s %s  OK - %s\n' "$table" "$code" "$label" ;;
    blocked:200)             printf '  %-9s %s  PROBLEM - readable by anyone\n' "$table" "$code"; return 1 ;;
    *)                       printf '  %-9s %s  unexpected, expected %s\n' "$table" "$code" "$want"; return 1 ;;
  esac
}

echo "Asking as a stranger would:"
failed=0
check messages blocked  "private, as it should be"   || failed=1
check projects readable "public, as it should be"    || failed=1

echo
if [ "$failed" -eq 0 ]; then
  echo "All good."
else
  echo "Something needs attention - see supabase/rls-policies.sql"
  exit 1
fi
