#!/usr/bin/env bash
# Checks what a stranger can actually reach, using the same publishable key
# that ships in the browser bundle. Run from the project root after any
# change to policies:   ./supabase/check-rls.sh
#
# Note on what "protected" looks like: row level security does not reject the
# request, it filters the rows away. A protected table answers 200 with an
# empty array. An error code means the table grant is missing, which is also
# fine here. What must never come back is 200 with rows in it.
#
# Reads .env only to avoid pasting credentials around, and never prints the
# key. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to check elsewhere.

set -uo pipefail

if [ -z "${VITE_SUPABASE_URL:-}" ] || [ -z "${VITE_SUPABASE_ANON_KEY:-}" ]; then
  if [ ! -f .env ]; then
    echo "No .env here. Run this from the project root." >&2
    exit 1
  fi
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

url="${VITE_SUPABASE_URL%/}"
failed=0

ask() { # table -> "<status> <body>"
  curl -s -w '\n%{http_code}' --max-time 20 \
    -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
    "${url}/rest/v1/$1?select=id&limit=1"
}

echo "Asking as a stranger would:"

# --- messages: must not come back with any rows ---------------------------
out=$(ask messages); code=$(printf '%s' "$out" | tail -n1); body=$(printf '%s' "$out" | sed '$d' | tr -d '[:space:]')
case "$code" in
  000)     echo "  messages  could not reach the server (network or wrong URL)"; failed=1 ;;
  401|403) echo "  messages  $code  OK - the table refuses strangers outright" ;;
  200)
    if [ "$body" = "[]" ]; then
      echo "  messages  200 []  OK - no rows visible to a stranger"
      echo "            (if you have never received a message, this proves nothing)"
    else
      echo "  messages  200 with rows  PROBLEM - readable by anyone"
      failed=1
    fi ;;
  *)       echo "  messages  $code  unexpected"; failed=1 ;;
esac

# --- projects: should come back readable ----------------------------------
out=$(ask projects); code=$(printf '%s' "$out" | tail -n1); body=$(printf '%s' "$out" | sed '$d' | tr -d '[:space:]')
case "$code" in
  000) echo "  projects  could not reach the server"; failed=1 ;;
  200)
    if [ "$body" = "[]" ]; then
      echo "  projects  200 []  the portfolio looks empty to visitors"
      echo "            (fine if you have no projects yet, a problem if you do)"
    else
      echo "  projects  200 with rows  OK - the portfolio is public"
    fi ;;
  *)   echo "  projects  $code  PROBLEM - visitors cannot see the portfolio"; failed=1 ;;
esac

echo
if [ "$failed" -eq 0 ]; then echo "All good."; else
  echo "Something needs attention - see supabase/rls-policies.sql"; exit 1
fi
