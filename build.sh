#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt --exclude-editable numpy pandas
pip install numpy==1.16.0
pip install pandas==1.3.5
npm run build