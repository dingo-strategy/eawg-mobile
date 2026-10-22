#!/bin/bash
set -euo pipefail

# Alleen in cloudsessies draaien
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Cloudflare-tool om de site te deployen (wrangler.toml staat in de root)
if ! command -v wrangler >/dev/null 2>&1; then
  npm install -g wrangler
fi

# Python: Word/Excel/PowerPoint maken, tests en codecontrole
pip3 install --break-system-packages -q python-docx openpyxl python-pptx pytest pyflakes pillow
