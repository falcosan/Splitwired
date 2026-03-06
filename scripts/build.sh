#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

error() { echo -e "${RED}[ERROR]${NC} $1" >&2; exit 1; }
info() { echo -e "${GREEN}[INFO]${NC} $1"; }

[[ -f "requirements.txt" ]] || error "requirements.txt not found"

pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

info "Build completed!"
