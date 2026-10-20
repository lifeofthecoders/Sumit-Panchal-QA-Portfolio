#!/usr/bin/env bash
# Quick health checks for the backend and Cloudinary
set -euo pipefail

BASE=https://sumit-panchal-qa-portfolio.onrender.com

echo "GET $BASE/api/health"
curl -i "$BASE/api/health" || true

echo "\nGET $BASE/api/cloudinary-health"
curl -i "$BASE/api/cloudinary-health" || true

echo "\nPOST $BASE/api/blogs/upload-test"
curl -i -X POST "$BASE/api/blogs/upload-test" || true

echo "\nDone"
