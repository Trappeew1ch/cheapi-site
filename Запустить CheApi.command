#!/bin/bash
# CheApi — локальный запуск на macOS.
# Двойной клик в Finder. Остановка — Ctrl+C в этом окне.

cd "$(dirname "$0")" || exit 1

clear
cat <<'BANNER'
  ┌──────────────────────────────────────────────┐
  │                 CheApi                       │
  │        локальный запуск проекта              │
  └──────────────────────────────────────────────┘
BANNER
echo

pause() {
  echo
  read -n 1 -s -r -p "Нажмите любую клавишу, чтобы закрыть окно…"
  echo
}

fail() {
  echo
  echo "✖ $1"
  pause
  exit 1
}

# ── Node.js ──────────────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  fail "Node.js не найден. Установите Node.js 22+ с https://nodejs.org и запустите снова."
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 22 ]; then
  fail "Нужен Node.js 22 или новее (сейчас $(node -v)). Обновите Node.js: https://nodejs.org"
fi

echo "✓ Node.js $(node -v)"

# ── Локальный env ────────────────────────────────────────────────────────────
if [ ! -f .env.local ]; then
  if [ ! -f .env.example ]; then
    fail "Не найден .env.example — проверьте, что вы запускаете файл из папки проекта."
  fi
  cp .env.example .env.local
  /usr/bin/sed -i '' 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=http://localhost:3000|' .env.local
  echo "✓ Создан .env.local (локальный URL, пустой upstream-ключ — работает демо-режим)"
fi

# ── Зависимости ──────────────────────────────────────────────────────────────
if [ ! -d node_modules ]; then
  echo "→ Устанавливаю зависимости (первый запуск, это может занять минуту)…"
  npm install || fail "npm install завершился с ошибкой. Проверьте интернет и попробуйте снова."
fi

# ── Уже запущено? ────────────────────────────────────────────────────────────
if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "✓ Сервер уже запущен на http://localhost:3000"
  [ "${CHEAPI_NO_OPEN:-0}" = "1" ] || open "http://localhost:3000"
  pause
  exit 0
fi

# ── Запуск ───────────────────────────────────────────────────────────────────
echo
echo "→ Запускаю CheApi на http://localhost:3000"
echo "  Демо-вход: demo@cheapi.ru / demo1234"
echo "  Остановка: Ctrl+C"
echo

(
  for _ in $(seq 1 90); do
    if curl -fsS "http://localhost:3000" >/dev/null 2>&1; then
      [ "${CHEAPI_NO_OPEN:-0}" = "1" ] || open "http://localhost:3000"
      break
    fi
    sleep 1
  done
) &
WATCH_PID=$!

npm run dev
STATUS=$?

kill "$WATCH_PID" >/dev/null 2>&1

echo
if [ "$STATUS" -eq 0 ] || [ "$STATUS" -eq 130 ]; then
  echo "Сервер остановлен."
else
  echo "Сервер завершился с кодом $STATUS. Проверьте сообщения выше."
fi
pause
