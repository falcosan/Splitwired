#!/usr/bin/env bash
# exit on error
set -o errexit

yarn
yarn build
pip install --upgrade pip
pip install --upgrade -r requirements.txt