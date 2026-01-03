#!/bin/bash

packages=$(cut -d= -f1 requirements.txt | tr '\n' ' ')

uv pip install --upgrade $packages

for pkg in $packages; do
    uv pip show $pkg 2>/dev/null | grep -i "^version:" | sed "s/Version: /$pkg==/"
done > requirements.txt
