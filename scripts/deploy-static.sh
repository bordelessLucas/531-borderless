#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MIDDLEWARE_SRC="src/middleware.ts"
MIDDLEWARE_BAK="src/middleware.ts.static-bak"
AUTH_ACTIONS="src/features/auth/actions.ts"
AUTH_ACTIONS_BAK="src/features/auth/actions.ts.static-bak"
ATTR_ACTIONS="src/features/attractions/actions.ts"
ATTR_ACTIONS_BAK="src/features/attractions/actions.ts.static-bak"
ADMIN_SRC="src/app/admin"
ADMIN_BAK=".static-export-bak/admin"

cleanup() {
  if [[ -f "$MIDDLEWARE_BAK" ]]; then
    mv "$MIDDLEWARE_BAK" "$MIDDLEWARE_SRC"
  fi
  if [[ -f "$AUTH_ACTIONS_BAK" ]]; then
    mv "$AUTH_ACTIONS_BAK" "$AUTH_ACTIONS"
  fi
  if [[ -f "$ATTR_ACTIONS_BAK" ]]; then
    mv "$ATTR_ACTIONS_BAK" "$ATTR_ACTIONS"
  fi
  if [[ -d "$ADMIN_BAK" ]]; then
    mkdir -p "$(dirname "$ADMIN_SRC")"
    mv "$ADMIN_BAK" "$ADMIN_SRC"
  fi
  rmdir .static-export-bak 2>/dev/null || true
}
trap cleanup EXIT

echo "→ Preparando export estático (plano Spark / sem Cloud Functions)…"

if [[ -f "$MIDDLEWARE_SRC" ]]; then
  mv "$MIDDLEWARE_SRC" "$MIDDLEWARE_BAK"
fi

# Admin fora de src/app — Next não pode tratar *.static-bak como rota
if [[ -d "$ADMIN_SRC" ]]; then
  mkdir -p .static-export-bak
  mv "$ADMIN_SRC" "$ADMIN_BAK"
fi

# Server Actions incompatíveis com output: export — stubs só no build estático
if [[ -f "$AUTH_ACTIONS" ]]; then
  mv "$AUTH_ACTIONS" "$AUTH_ACTIONS_BAK"
  cat > "$AUTH_ACTIONS" <<'EOF'
import type { UserRole } from "@/features/auth/types";

export async function establishSession(_idToken: string): Promise<{
  ok: boolean;
  role?: UserRole;
  message?: string;
}> {
  return {
    ok: false,
    message: "Sessão server-side indisponível neste preview estático.",
  };
}

export async function clearSession(): Promise<void> {}
EOF
fi

if [[ -f "$ATTR_ACTIONS" ]]; then
  mv "$ATTR_ACTIONS" "$ATTR_ACTIONS_BAK"
  cat > "$ATTR_ACTIONS" <<'EOF'
export type AttractionActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function saveAttraction(
  _prev: AttractionActionState,
  _formData: FormData,
): Promise<AttractionActionState> {
  return {
    ok: false,
    message: "Admin write indisponível neste preview estático.",
  };
}
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
