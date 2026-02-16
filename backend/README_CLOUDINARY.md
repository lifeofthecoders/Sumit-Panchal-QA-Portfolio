 # Cloudinary & Render — deployment checklist

 This document describes the exact steps to finish enabling image uploads for the backend deployed on Render and test the end-to-end flow from the GitHub Pages frontend.

 Steps you must perform (order matters)

 1) Ensure your Cloudinary account is active
    - Sign in to https://cloudinary.com and confirm your cloud name (top-left) and that the account is active.
    - If you see messages about the account being disabled, suspended, or needing verification, follow Cloudinary's dashboard instructions or contact Cloudinary support.

 2) Add Cloudinary credentials to Render environment
    - Go to Render dashboard → Your service → Environment
    - Add these environment variables (copy values from Cloudinary dashboard):
      - `CLOUDINARY_CLOUD_NAME` — your cloud name (string)
      - `CLOUDINARY_API_KEY` — API key
      - `CLOUDINARY_API_SECRET` — API secret
    - Save and trigger a redeploy (click "Manual Deploy" or push a new commit).

 3) Verify backend is up and Cloudinary is reachable
    - After redeploy, run these from your terminal (or paste the URLs in browser):

 ```bash
 curl -i https://sumit-panchal-qa-portfolio.onrender.com/api/health
 curl -i https://sumit-panchal-qa-portfolio.onrender.com/api/cloudinary-health
 curl -i -X POST https://sumit-panchal-qa-portfolio.onrender.com/api/blogs/upload-test
 ```

 Expected results
  - `/api/health` → 200 OK
  - `/api/cloudinary-health` → 200 OK (when Cloudinary creds are valid) OR 503 with a descriptive error (if auth failed)
  - `/api/blogs/upload-test` → 200 OK

 4) Rebuild & redeploy the frontend
    - Either set `VITE_API_BASE_URL` during the build to `https://sumit-panchal-qa-portfolio.onrender.com` OR make sure you pushed the runtime fix (already made in `src/services/blogService.js`) and rebuild/publish your GitHub Pages site.

 5) Test an upload from the live site
    - Use the admin UI to upload an image and watch DevTools → Network for `/api/blogs/upload` request and response.

 If anything fails
  - Paste the output of `/api/cloudinary-health` and the failing browser Network request (Headers + Response). If the server throws a 5xx, paste the Render request/worker logs for that failing POST — Render shows logs in the service's Logs view.

 Useful scripts
  - `scripts/test_cloudinary_health.sh` — quick curl health checks
  - `scripts/test_upload_multipart.sh` — example curl multipart upload (replace file path)

 How to collect Render logs for a failing request
  - Go to your Render service → Logs
  - Reproduce the failing upload from the frontend
  - Copy/paste the worker logs produced around the same timestamp (look for stack traces)

 Security note
  - Do NOT commit or paste your Cloudinary API secret into public places (GitHub). Use Render's environment variables to keep secrets safe.

 If you paste the `/api/cloudinary-health` output and any failing network request, I will analyze and give the exact fix.
