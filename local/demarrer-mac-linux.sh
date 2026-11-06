#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
 printf 'Installez Node.js LTS depuis https://nodejs.org puis relancez.\n'
 exit 1
fi
node server.cjs
