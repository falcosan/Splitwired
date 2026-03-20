#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

source "$PROJECT_DIR/.venv/bin/activate"
cd "$PROJECT_DIR"

packages=$(cut -d= -f1 requirements.txt)

uv pip install --upgrade $(echo "$packages" | tr '\n' ' ')

freeze=$(uv pip freeze)
for pkg in $packages; do
    echo "$freeze" | grep -i "^${pkg}=="
done > requirements.txt
