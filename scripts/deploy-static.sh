#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MIDDLEWARE_SRC="src/middleware.ts"
MIDDLEWARE_BAK="src/middleware.ts.static-bak"
AUTH_ACTIONS="src/features/auth/actions.ts"
AUTH_ACTIONS_BAK="src/features/auth/actions.ts.static-bak"

cleanup() {
  if [[ -f "$MIDDLEWARE_BAK" ]]; then
    mv "$MIDDLEWARE_BAK" "$MIDDLEWARE_SRC"
  fi
  if [[ -f "$AUTH_ACTIONS_BAK" ]]; then
    mv "$AUTH_ACTIONS_BAK" "$AUTH_ACTIONS"
  fi
}
trap cleanup EXIT

echo "→ Preparando export estático (plano Spark / sem Cloud Functions)…"

# Middleware exige runtime de servidor; o admin usa AdminGuard no client.
if [[ -f "$MIDDLEWARE_SRC" ]]; then
  mv "$MIDDLEWARE_SRC" "$MIDDLEWARE_BAK"
fi

# Server Actions não existem em output: export. O login cai no papel vindo do Firestore.
if [[ -f "$AUTH_ACTIONS" ]]; then
  mv "$AUTH_ACTIONS" "$AUTH_ACTIONS_BAK"
  cat > "$AUTH_ACTIONS" <<'EOF'
import type { UserRole } from "@/features/auth/types";

export async function establishSession(_idToken: string): Promise<{
  ok: boolean;
  role?: UserRole;
  message?: string;
}> {
  return { ok: false, message: "Sessão de servidor indisponível no Hosting estático." };
}

export async function clearSession(): Promise<void> {}
EOF
fi

export STATIC_EXPORT=1
rm -rf out .next

echo "→ Build estático…"
npx next build

if [[ ! -d out ]]; then
  echo "ERRO: pasta out/ não gerada."
  exit 1
fi

if [[ -f out/404/index.html && ! -f out/404.html ]]; then
  cp out/404/index.html out/404.html
fi

echo "→ Deploy Firebase Hosting (estático)…"
npx -y firebase-tools@latest deploy --only hosting --project gustavo-c049a --non-interactive

echo "✓ Publicado em https://gustavo-c049a.web.app"
