#!/usr/bin/env bash
# exit on error
set -o errexit

yarn
yarn build
pip install --upgrade pip
pip install $(grep -vE "pip-autoremove" requirements.txt)