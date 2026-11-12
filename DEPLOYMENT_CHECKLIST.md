# Deployment Checklist — Blog Image Permanence & Cloudinary

**Project:** Sumit Panchal | Quality Assurance Portfolio  
**Feature:** Blog Image Upload and Permanent Image Storage  
**Frontend:** React + Vite + GitHub Pages  
**Backend:** Node.js + Express + Render  
**Database:** MongoDB Atlas  
**Image Storage:** Cloudinary

---

## 1. Deployment Overview

This checklist covers the verification and deployment of the blog image upload functionality.

The intended image upload workflow is:

```text
Administrator
     |
     v
React Blog Form
     |
     v
Frontend Image Validation
     |
     v
Image Compression
     |
     v
Authenticated Backend API
     |
     v
Multer Memory Storage
     |
     v
Cloudinary Upload
     |
     v
Secure HTTPS Image URL
     |
     v
MongoDB Blog Record
```

Blog images are stored on Cloudinary rather than the backend server's local filesystem.

The blog record stores the Cloudinary image URL so that the image remains accessible independently of the backend process lifecycle, provided the Cloudinary asset and account remain available.

---

## 2. Files Responsible for Image Upload

### Backend

- [ ] `backend/src/middlewares/uploadBlogImage.js` — Multer memory storage, upload-size restrictions, MIME validation, and image-signature validation.
- [ ] `backend/src/routes/blogs.js` — Authenticated blog image upload endpoint and Cloudinary upload processing.
- [ ] `backend/src/config/cloudinary.js` — Cloudinary SDK configuration.

### Frontend

- [ ] `src/services/imageUtils.js` — Original image validation and compression.
- [ ] `src/services/blogService.js` — Authenticated image upload request, timeout, progress tracking, and response validation.
- [ ] `src/admin/BlogForm.jsx` — Image selection, preview, upload progress, warning notification, and error handling.

### Important implementation details

The current backend uses Multer memory storage. The image is received as a buffer and uploaded to Cloudinary by the backend route.

The application does not rely on permanent local image storage or a local-file fallback for blog images.

---

## 3. Pre-Deployment Checklist

### Code Quality

- [ ] Review all modified frontend files.
- [ ] Review all modified backend files.
- [ ] Check for unused imports and variables.
- [ ] Confirm there are no syntax errors.
- [ ] Confirm the existing frontend functionality is preserved.
- [ ] Confirm upload errors are handled correctly.
- [ ] Confirm no local filesystem fallback is used for blog image uploads.
- [ ] Confirm Cloudinary upload failures do not produce a successful local image URL.

### Frontend Image Validation

Verify the following configuration:

| Setting | Expected behavior |
|---|---|
| Original image selection limit | 50 MB |
| Large-image warning threshold | Above 10 MB |
| Warning display | Non-blocking toast |
| Compression | Continues after the warning |
| Maximum resize width | 1920 pixels |
| JPEG compression quality | 0.75 |
| Compressed image upload limit | 5 MiB at backend |

- [ ] Original images up to the frontend's 50 MB limit can be selected.
- [ ] Images larger than 10 MB trigger the warning toast.
- [ ] The warning does not block compression.
- [ ] Image preview works.
- [ ] Compression completes successfully.
- [ ] The compressed image can be uploaded when within the backend limit.
- [ ] Oversized compressed files are rejected by the backend.

### Backend Image Validation

Verify:

| Setting | Expected configuration |
|---|---|
| Maximum file size | 5 MiB |
| Maximum files | 1 |
| Maximum multipart fields | 10 |
| Maximum multipart parts | 11 |
| Accepted backend MIME types | JPEG, PNG, WebP |
| Image signature verification | Enabled |
| Temporary storage | Multer memory storage |

- [ ] Invalid image types are rejected.
- [ ] Invalid binary image signatures are rejected.
- [ ] Files exceeding the configured upload limit are rejected.
- [ ] Cloudinary configuration is checked before upload processing.
- [ ] Cloudinary upload errors are returned as appropriate HTTP errors.
- [ ] The backend returns a valid HTTPS Cloudinary image URL.

---

## 4. Configuration Verification

### Local environment

Check:

`backend/.env`

Required Cloudinary environment variable names:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Also verify that the MongoDB and other required backend environment variables are configured.

For local MongoDB development, the connection may use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/qa_portfolio
```

For MongoDB Atlas, use your configured Atlas connection string.

### Production environment

Open:

Render Dashboard → QA Portfolio Backend → Environment

Verify that these variables are configured:

- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `MONGODB_URI`
- [ ] Other required backend environment variables.

**Security requirements:**

- [ ] No real Cloudinary API secrets appear in Git-tracked Markdown files.
- [ ] No real credentials are committed to GitHub.
- [ ] Production credentials are configured through Render.
- [ ] Local credentials are stored in the ignored `backend/.env` file.

---

## 5. Dependencies Verification

From the backend directory:

```bash
cd backend
npm install
```

The current upload implementation uses Multer memory storage and the Cloudinary SDK.

Do not add `multer-storage-cloudinary` solely for the current upload workflow. The backend route uploads the received image buffer to Cloudinary.

Check the existing dependency configuration in:

`backend/package.json`

Avoid adding duplicate or unused dependencies.

---

## 6. Local Testing

### Step 1 — Start the backend

Open the first terminal:

```bash
cd backend
npm install
npm run dev
```

Expected result:

- Backend starts successfully.
- MongoDB connection is established.
- Server listens on the configured port, normally 5000.

Local backend URL:

```text
http://localhost:5000
```

### Step 2 — Start the frontend

Open another terminal in the project root:

```bash
npm install
npm run dev
```

Expected result:

- Vite development server starts successfully.
- Frontend is accessible at the configured local development URL, normally `http://localhost:5173`.

### Step 3 — Verify backend health

Open:

```text
http://localhost:5000/api/health
```

Verify that the backend and MongoDB connection are healthy.

### Step 4 — Verify Cloudinary health

Open:

```text
http://localhost:5000/api/cloudinary-health
```

Verify that the Cloudinary connection check succeeds.

---

## 7. Manual Image Upload Testing

1. Open the local frontend.
2. Sign in to the administrator panel.
3. Navigate to Admin Dashboard → Blogs.
4. Click Add New Blog.
5. Select a valid image.
6. Verify that image compression completes.
7. Select an image larger than 10 MB and verify the warning toast appears.
8. Confirm that the warning does not stop compression.
9. Fill in the required blog information.
10. Click Publish Blog.
11. Observe the upload progress indicator.
12. Open Developer Tools → Network.
13. Find the `POST /api/blogs/upload` request.
14. Verify the request is sent to the backend.
15. Verify that the response contains an HTTPS Cloudinary image URL.
16. Confirm that the blog is saved successfully.
17. Open the published blog.
18. Confirm that the image is displayed correctly.

### Expected successful upload response

```json
{
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/...",
  "public_id": "your-cloudinary-public-id"
}
```

The actual response must contain the URL returned by Cloudinary.

---

## 8. Image Permanence Testing

### Test 1 — Restart the backend

1. Upload an image to a new blog.
2. Publish the blog.
3. Verify that the image is displayed.
4. Stop the backend using `Ctrl + C`.
5. Restart the backend using `npm run dev`.
6. Reload the blog detail page.
7. Verify that the image is still displayed.
8. Check that the image URL still points to Cloudinary.

### Test 2 — Delete the original local image

1. Select and upload an image.
2. Publish the blog successfully.
3. Delete the original image from your computer.
4. Reload the blog detail page.
5. Verify that the uploaded image still displays.

### Test 3 — Verify the stored image URL

Open the browser Developer Tools → Network tab.

Inspect the image request.

Expected URL pattern:

```text
https://res.cloudinary.com/<cloud-name>/image/upload/...
```

The image should not depend on:

- Local computer file paths.
- Browser blob URLs.
- Backend temporary upload files.
- A local `/uploads/` directory.

### Test 4 — Verify persistence after deployment

1. Upload a new image.
2. Publish the blog.
3. Verify the image is displayed.
4. Deploy the backend.
5. Reopen the published blog.
6. Confirm that the image still displays.

A successful test confirms that the blog references the Cloudinary-hosted asset rather than temporary backend storage.

---

## 9. Backend Validation and Syntax Checks

From the project root:

```bash
node --check backend/src/middlewares/uploadBlogImage.js
node --check backend/src/routes/blogs.js
node --check backend/src/config/cloudinary.js
```

Verify whitespace and patch formatting:

```bash
git diff --check
```

Check frontend production build:

```bash
npm run build
```

These checks should complete successfully before deployment.

---

## 10. Deployment to Render

### Step 1 — Review backend changes

Check:

```bash
git status
git diff
```

Review the backend changes before committing.

### Step 2 — Commit and push

Only after reviewing the changes:

```bash
git add .
git commit -m "Fix permanent blog image uploads"
git push origin main
```

### Step 3 — Verify Render deployment

1. Open the Render Dashboard.
2. Select the QA Portfolio backend service.
3. Open the Deploys section.
4. Verify that the new deployment starts.
5. Review deployment logs.
6. Verify that the deployment completes successfully.
7. Check the backend health endpoint.
8. Check the Cloudinary health endpoint.

If automatic deployment is disabled, use Render's Manual Deploy option.

---

## 11. Deployment to GitHub Pages

The frontend deployment is managed through:

`.github/workflows/deploy.yml`

The expected workflow is:

1. Push the approved frontend changes to the configured GitHub branch.
2. Open the repository's Actions tab.
3. Verify that the deployment workflow starts.
4. Wait for the build and deployment jobs to finish.
5. Confirm the workflow succeeds.
6. Open the live portfolio.
7. Verify the updated blog administration functionality.

Production frontend:

https://lifeofthecoders.github.io/Sumit-Panchal-QA-Portfolio/

The current production API URL is configured in:

`src/config/api.js`

```text
https://sumit-panchal-qa-portfolio-1h3z.onrender.com
```

No separate `VITE_API_BASE_URL` variable is required by the current API configuration.

---

## 12. Production Verification

### Backend health

https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/health

- [ ] Backend is reachable.
- [ ] MongoDB is connected.
- [ ] Health endpoint returns a successful response.

### Cloudinary health

https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/cloudinary-health

- [ ] Cloudinary credentials are configured.
- [ ] Cloudinary connectivity check succeeds.

### Actual image upload

- [ ] Administrator can sign in.
- [ ] Add Blog page opens.
- [ ] Image selection works.
- [ ] Large-image warning toast works.
- [ ] Image compression completes.
- [ ] Upload progress displays correctly.
- [ ] Image upload request reaches the Render backend.
- [ ] Backend returns a Cloudinary HTTPS URL.
- [ ] Blog publishing succeeds.
- [ ] Published image is displayed correctly.
- [ ] Image remains accessible after backend restart or redeployment.

---

## 13. Troubleshooting

### Image upload fails

Check:

- Administrator authentication.
- Backend service availability.
- Browser Network tab.
- Backend logs.
- Cloudinary credentials.
- Cloudinary upload preset.
- Image file size.
- Image MIME type and binary signature.

### Cloudinary is unavailable

Check the Render Environment section for:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Save corrected environment variables and verify the backend deployment.

### HTTP 413 — File too large

The compressed file exceeds the backend's 5 MiB upload limit.

Try a smaller source image or reduce its dimensions and compression output size.

### HTTP 415 — Unsupported image

Use a valid supported image.

The backend accepts JPEG, PNG, and WebP.

### HTTP 401 — Unauthorized

The administrator JWT may be missing, invalid, expired, or invalidated.

Sign in again and retry.

### HTTP 502 — Image upload failed

Check:

- Cloudinary connectivity.
- Cloudinary upload configuration.
- Render backend logs.
- Cloudinary account status.

### Image disappears after restart

Inspect the saved blog image URL.

It should reference Cloudinary, not a local filesystem or temporary URL.

---

## 14. Rollback Plan

If a deployment introduces a critical regression, identify the relevant commit first:

```bash
git log --oneline -10
```

Revert the specific commit:

```bash
git revert <commit-hash>
```

Push the rollback:

```bash
git push origin main
```

Verify the resulting GitHub Actions and Render deployments.

**Important:** Rolling back application code does not automatically restore deleted Cloudinary assets or MongoDB records. Review data changes independently.

---

## 15. Final Success Criteria

The image permanence fix can be considered verified when:

1. A valid image can be selected in the administrator panel.
2. Images larger than 10 MB show a warning toast without blocking compression.
3. A compressed image within the 5 MiB backend limit uploads successfully.
4. Cloudinary returns a secure HTTPS image URL.
5. The blog record saves successfully in MongoDB.
6. The image displays correctly on the published blog.
7. The image remains accessible after restarting the backend.
8. The image remains accessible after backend redeployment.
9. The image remains accessible after deleting the original local image.
10. No local backend file URL or browser blob URL is used as the permanent blog image URL.

If all above pass, **Image Permanence Fix is successful!** 🎉

### Target Result

**All blog images are uploaded to Cloudinary and referenced through secure HTTPS URLs stored with their MongoDB blog records.**

---

**Precision in Every Detail. Quality in Every Release.**

© Sumit Panchal | Quality Assurance Portfolio
