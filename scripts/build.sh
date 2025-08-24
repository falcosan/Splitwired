#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

error() { echo -e "${RED}[ERROR]${NC} $1" >&2; exit 1; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1" >&2; }
info() { echo -e "${GREEN}[INFO]${NC} $1"; }

[[ -f "package.json" ]] || error "package.json not found"
[[ -f "requirements.txt" ]] || error "requirements.txt not found"

if command -v npm >/dev/null 2>&1; then
    info "Building frontend..."
    npm install --silent
    npm run build --silent
else
    error "npm not found. Please install Node.js/npm first"
fi

info "Setting up Python environment."
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

info "Build completed!"
