#!/usr/bin/env bash
# Example multipart upload test. Replace FILE with an actual image file on your machine.
set -euo pipefail

BASE=https://sumit-panchal-qa-portfolio.onrender.com
FILE="${1:-D:/Projects/Sumit-Panchal-QA-Portfolio/tinyfile.txt}"

echo "Uploading $FILE to $BASE/api/blogs/upload"
curl -i -X POST -H "Origin: https://lifeofthecoders.github.io" \
  -F "image=@${FILE};type=image/png" \
  "$BASE/api/blogs/upload" || true
