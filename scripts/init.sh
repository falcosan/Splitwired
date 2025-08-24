#!/bin/bash

rm -rf .venv
uv venv
source .venv/bin/activate

temp_file=$(mktemp)
while IFS= read -r line; do
    if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        echo "$line" >> "$temp_file"
    else
        package_name=$(echo "$line" | sed 's/[<>=!].*//' | xargs)
        if [[ -n "$package_name" ]]; then
            echo "$package_name" >> "$temp_file"
        fi
    fi
done < requirements.txt

uv pip install $(grep -v '^[[:space:]]*#' "$temp_file" | grep -v '^[[:space:]]*$' | tr '\n' ' ')

final_temp=$(mktemp)
installed_packages=$(uv pip freeze)

while IFS= read -r line; do
    if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        echo "$line" >> "$final_temp"
    else
        package_name=$(echo "$line" | sed 's/[<>=!].*//' | xargs)
        if [[ -n "$package_name" ]]; then
            version_line=$(echo "$installed_packages" | grep "^${package_name}==")
            echo "${version_line:-$line}" >> "$final_temp"
        fi
    fi
done < requirements.txt

mv "$final_temp" requirements.txt
uv pip install -r requirements.txt
rm -f "$temp_file"
