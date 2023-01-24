#!/usr/bin/env bash
# exit on error
set -o errexit

curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install
npm run build
pip install --upgrade pip
pip install $(grep -vE "numpy|pandas" requirements.txt)
pip install numpy==1.16.0
pip install pandas==1.3.5