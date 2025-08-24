#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'


print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if [[ ! -f "package.json" ]]; then
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

if [[ ! -f "requirements.txt" ]]; then
    print_error "requirements.txt not found. Are you in the correct directory?"
    exit 1
fi

print_status "Installing frontend dependencies..."
if command -v npm &> /dev/null; then
    npm install
    print_status "Building frontend assets..."
    npm run build
else
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Upgrading pip..."
pip install --upgrade pip

print_status "Installing Python dependencies..."
pip install -r requirements.txt

print_status "Build completed successfully!"