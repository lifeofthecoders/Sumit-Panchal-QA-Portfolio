# Cloudinary & Render — Deployment and Configuration Guide

**Project:** Sumit Panchal | Quality Assurance Portfolio  
**Frontend:** React + Vite + GitHub Pages  
**Backend:** Node.js + Express + Render  
**Image Storage:** Cloudinary  
**Database:** MongoDB Atlas

---

## 1. Overview

This document explains how Cloudinary image uploads are configured in the QA Portfolio project, how to deploy the backend on Render, and how to verify the complete image-upload workflow from the live GitHub Pages frontend.

The application uses the following architecture:

```text
Administrator
     |
     v
GitHub Pages Frontend
     |
     v
Render Backend API
     |
     v
Image Validation (Multer)
     |
     v
Cloudinary Image Upload
     |
     v
Secure HTTPS Image URL
     |
     v
MongoDB Blog Record
```

Blog images are uploaded through the authenticated backend and stored permanently on Cloudinary.

The backend temporarily holds the uploaded image in memory before forwarding it to Cloudinary. It does not use local disk storage for permanent blog images.

---

## 2. Cloudinary Account Setup

Sign in to your Cloudinary account:

https://cloudinary.com

Verify that:

1. Your Cloudinary account is active.
2. Your cloud name is correct.
3. Your API key is available.
4. Your API secret is available.
5. Your upload configuration is accessible.

### Required Cloudinary configuration

The backend uses the following environment variables:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

These credentials are loaded in:

`backend/src/config/cloudinary.js`

The application initializes the Cloudinary SDK using these values.

### Cloudinary upload preset

The blog upload route currently uses:

`qa_portfolio_preset`

The upload preset must exist in your Cloudinary account and be compatible with the upload configuration used by the backend.

The upload implementation is located in:

`backend/src/routes/blogs.js`

---

## 3. Configure Cloudinary Credentials on Render

Cloudinary credentials must be configured on the production backend.

### Steps

1. Open the Render Dashboard.
2. Select your QA Portfolio backend service.
3. Navigate to **Environment**.
4. Add or update the following environment variables:

| Variable | Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

5. Save the changes.
6. Allow Render to deploy the updated environment configuration.

If automatic deployment does not start, use the Render Manual Deploy option.

**Security:** Never commit Cloudinary credentials to GitHub or place API secrets in frontend code, README files, screenshots, or public documentation.

For local development, use the backend environment file:

`backend/.env`

For production, configure the values through Render environment variables.

---

## 4. Production Backend Configuration

The production backend URL is:

https://sumit-panchal-qa-portfolio-1h3z.onrender.com

The frontend API configuration is maintained in:

`src/config/api.js`

The current production configuration uses:

```js
const PRODUCTION_API_BASE_URL =
  "https://sumit-panchal-qa-portfolio-1h3z.onrender.com";

const API_BASE_URL = import.meta.env.DEV
  ? ""
  : PRODUCTION_API_BASE_URL;
```

During local development, the frontend uses the configured Vite API proxy.

In production, API requests use the Render backend URL.

**Important:** The current project does not require a separate `VITE_API_BASE_URL` environment variable. Do not add one unless the API configuration is intentionally changed.

---

## 5. Verify Backend and Cloudinary Connectivity

After the Render deployment completes, verify both health endpoints.

### A. Backend and database health

Endpoint:

https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/health

Run:

```bash
curl -i https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/health
```

Expected healthy response:

```json
{
  "ok": true,
  "service": "qa-portfolio-backend",
  "message": "Backend and database are ready",
  "database": {
    "connected": true
  }
}
```

The endpoint checks whether the backend is running and MongoDB is connected.

A response with HTTP 503 indicates that the backend is running in a degraded state because the database is not connected.

### B. Cloudinary health

Endpoint:

https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/cloudinary-health

Run:

```bash
curl -i https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/cloudinary-health
```

Expected successful response:

```json
{
  "ok": true,
  "message": "Cloudinary connected successfully"
}
```

The Cloudinary health endpoint performs an actual Cloudinary connectivity check using the SDK ping operation.

Possible results:

| HTTP Status | Meaning |
|---|---|
| 200 OK | Cloudinary connection successful |
| 503 Service Unavailable | Cloudinary is not configured or the connectivity check failed |

**Important:** A successful Cloudinary health check confirms connectivity. It does not independently prove that the blog upload preset or complete image-upload workflow is working. Perform an actual authenticated upload test as well.

---

## 6. Actual Blog Image Upload Endpoint

The application uses the following protected endpoint:

```text
POST /api/blogs/upload
```

The route is implemented in:

`backend/src/routes/blogs.js`

The upload middleware is:

`backend/src/middlewares/uploadBlogImage.js`

### Authentication

The upload endpoint requires a valid administrator JWT.

Request header:

```http
Authorization: Bearer YOUR_ADMIN_TOKEN
```

The request must use:

`Content-Type: multipart/form-data`

The image field name is:

`image`

The backend verifies administrator authentication before accepting the image upload.

### Successful response

The backend returns:

```json
{
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/...",
  "public_id": "your-cloudinary-public-id"
}
```

The returned HTTPS image URL is subsequently used when saving the blog record.

**Note:** The project does not currently implement a `/api/blogs/upload-test` endpoint. Use `/api/blogs/upload` for actual upload testing.

---

## 7. Image Upload Restrictions

The current implementation applies validation at both frontend and backend levels.

### Frontend validation

File:

`src/services/imageUtils.js`

The frontend initially accepts:

- JPEG / JPG
- PNG
- WebP
- GIF

Original file-size limit:

**50 MB**

Files larger than **10 MB** trigger a non-blocking warning toast in:

`src/admin/BlogForm.jsx`

The warning explains that uploading may take longer. It does not reject the selected image or stop the compression process.

The frontend compression function:

`compressImage()`

performs the following operations:

1. Reads the original image.
2. Resizes images wider than 1920 pixels.
3. Converts the image to JPEG.
4. Applies JPEG quality 0.75.
5. Returns a compressed image file.

The original image can therefore be converted before it reaches the backend.

GIF animation is not preserved because the compression function converts images to JPEG.

**Important:** The 50 MB limit applies to the original file selected in the frontend. The 10 MB threshold only triggers an informational warning. The backend applies a separate 5 MiB maximum to the compressed image it receives.

### Backend validation

File:

`backend/src/middlewares/uploadBlogImage.js`

The current enforced backend configuration is:

| Setting | Configuration |
|---|---|
| Maximum file size | 5 MiB |
| Maximum files per request | 1 |
| Maximum multipart fields | 10 |
| Maximum multipart parts | 11 |
| Allowed MIME types | JPEG, PNG, WebP |
| Image signature verification | Enabled |
| Upload storage | Memory storage |

The backend checks both the MIME type and the actual image binary signature.

It rejects invalid images and files that exceed the configured 5 MiB size limit.

For a successful upload, the compressed image must not exceed the backend's 5 MiB limit.

---

## 8. Upload Timeout and Progress Tracking

The project currently uses a five-minute timeout.

### Frontend timeout

File:

`src/services/blogService.js`

The upload request uses XMLHttpRequest when progress tracking is enabled.

Configured timeout:

```js
const timeoutId = setTimeout(() => {
  timeoutOccurred = true;
  xhr.abort();
}, 300000);
```

The fetch fallback also uses a 300000-millisecond timeout.

Therefore:

**Frontend upload timeout = 5 minutes.**

### Backend timeout

File:

`backend/server.js`

Current request/response timeout middleware:

```js
app.use((req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
});
```

Therefore:

**Backend request/response timeout = 5 minutes.**

These are application-level timeout configurations. They do not guarantee that an external proxy or hosting platform will keep every request open for the entire period.

### Upload progress tracking

The current upload progress works as follows:

| Progress | Activity |
|---|---|
| 5% | Initial progress notification during Render health check |
| 5–90% | Browser-reported upload progress |
| 100% | Successful response received and valid HTTPS image URL verified |

The frontend displays the progress through the upload indicator in:

`src/admin/BlogForm.jsx`

Progress reaching 100% means the upload endpoint returned a successful response with a valid HTTPS image URL.

The blog still needs to be saved separately after the upload succeeds.

---

## 9. End-to-End Upload Testing

Test the actual upload from the live administrator panel.

### Step 1 — Open the live portfolio

https://lifeofthecoders.github.io/Sumit-Panchal-QA-Portfolio/

### Step 2 — Sign in

Log in using your administrator credentials.

### Step 3 — Open Add Blog

Navigate to:

```text
Admin Dashboard → Blogs → Add New Blog
```

### Step 4 — Select an image

Choose a valid image file.

The frontend should:

- Validate the original file.
- Display a non-blocking warning toast if the original image exceeds 10 MB.
- Continue compression after displaying the warning.
- Compress the image.
- Generate an image preview.
- Prepare the compressed image for upload.

### Step 5 — Publish the blog

Complete the blog information and click Publish Blog.

The image upload begins during the publishing process.

### Step 6 — Verify the browser Network tab

Open:

```text
Developer Tools → Network
```

Find the request:

```text
POST /api/blogs/upload
```

Verify:

- HTTP request method is POST.
- The request uses the correct Render backend.
- The Authorization header contains the administrator token.
- The request payload includes the `image` multipart field.
- The backend returns a successful response.
- The response includes a secure Cloudinary HTTPS image URL.

### Step 7 — Verify blog creation

After the image upload succeeds, the frontend sends the blog information to the backend.

For a new blog:

```text
POST /api/blogs
```

For an existing blog:

```text
PUT /api/blogs/:id
```

Verify that the blog is saved successfully and the image is displayed using its Cloudinary URL.

---

## 10. Optional Upload Test Using cURL

The upload endpoint can also be tested independently from the browser.

Use a valid administrator JWT and a supported image file.

In Git Bash, set your token locally:

```bash
export ADMIN_TOKEN="YOUR_ADMIN_JWT_TOKEN"
```

Then run:

```bash
curl -i -X POST \
  "https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/blogs/upload" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "image=@/d/path/to/image.jpg"
```

Replace the file path with the actual image location.

The test image must:

- Be a valid JPEG, PNG, or WebP image.
- Have a valid image signature.
- Not exceed the backend's 5 MiB limit.

Expected successful response:

```json
{
  "imageUrl": "https://res.cloudinary.com/...",
  "public_id": "..."
}
```

An HTTP 401 response indicates an authentication problem.

An HTTP 413 response indicates the backend file-size limit was exceeded.

An HTTP 415 response indicates an unsupported or invalid image.

An HTTP 502 response indicates that the Cloudinary upload process failed.

Do not share administrator tokens in screenshots, GitHub commits, or public support requests.

---

## 11. Troubleshooting

### Issue: Backend is not reachable

**Possible causes:**

- Render service is starting or restarting.
- Backend deployment failed.
- Network connection is unavailable.
- Browser CORS configuration blocks the request.

**Recommended steps:**

1. Open `/api/health`.
2. Verify the Render service status.
3. Check Render logs.
4. Inspect the browser Network tab.
5. Retry once the service becomes available.

### Issue: MongoDB is disconnected

**Possible causes:**

- MongoDB Atlas is unavailable.
- Database connection configuration is incorrect.
- Network or IP access configuration prevents the connection.

**Recommended steps:**

1. Check `/api/health`.
2. Verify `MONGODB_URI` in Render.
3. Check MongoDB Atlas network access.
4. Review Render backend logs.

### Issue: Cloudinary is not configured

**Possible cause:**

One or more required Cloudinary environment variables are missing.

**Recommended steps:**

1. Open the Render environment settings.
2. Verify all three Cloudinary variable names.
3. Check their values against the Cloudinary dashboard.
4. Save the changes.
5. Allow the backend to redeploy.
6. Test `/api/cloudinary-health`.

### Issue: Cloudinary connectivity check fails

**Possible causes:**

- Incorrect credentials.
- Cloudinary account restrictions.
- Cloudinary service availability problems.

**Recommended steps:**

1. Check Cloudinary account status.
2. Verify the Cloudinary credentials.
3. Review the backend logs.
4. Check the Cloudinary status page.

### Issue: Invalid upload preset

**Possible cause:**

The upload preset `qa_portfolio_preset` is missing or incompatible with the backend upload configuration.

**Recommended steps:**

1. Open Cloudinary Console.
2. Navigate to Upload Settings.
3. Verify that `qa_portfolio_preset` exists.
4. Verify that its configuration is compatible with the current server-side upload operation.
5. Retry an authenticated upload.

### Issue: File size exceeded

**Cause:**

The backend currently enforces a 5 MiB upload limit.

**Recommended steps:**

1. Choose a smaller source image.
2. Reduce image dimensions.
3. Re-export the image at a lower file size.
4. Verify the compressed image does not exceed 5 MiB.
5. Retry publishing.

**Note:** The frontend warning for original images larger than 10 MB is informational. It does not override or increase the backend's 5 MiB limit.

### Issue: Upload timed out

**Cause:**

The request did not finish within the configured five-minute application timeout.

**Recommended steps:**

1. Check internet upload speed.
2. Try a smaller image.
3. Verify the Cloudinary health endpoint.
4. Check Render logs for the failed request.
5. Retry after identifying the cause.

### Issue: Invalid image URL

**Cause:**

The upload endpoint did not return a valid HTTPS image URL.

**Recommended steps:**

1. Inspect the backend upload response.
2. Check the Render logs.
3. Verify Cloudinary credentials and upload preset.
4. Confirm that the upload returned `imageUrl`.
5. Retry after correcting the issue.

### Issue: Administrator session expired

**Cause:**

The upload endpoint returned HTTP 401.

**Recommended steps:**

1. Sign in again.
2. Return to the administrator blog form.
3. Select the image again if required.
4. Retry publishing.

---

## 12. Render Logs and Diagnostics

When an upload fails:

1. Open the Render Dashboard.
2. Select the QA Portfolio backend service.
3. Open the Logs section.
4. Reproduce the failed image upload.
5. Identify the log entries matching the request time.
6. Inspect the Cloudinary or route error.

Useful diagnostic information includes:

- HTTP status code.
- Request method and endpoint.
- Cloudinary error message.
- Backend stack trace.
- Image file size.
- Image MIME type.
- Browser Console output.
- Browser Network request and response.

Remove sensitive information such as JWT tokens, API secrets, and personal credentials before sharing logs.

---

## 13. Frontend and Backend Deployment

### Backend deployment — Render

Backend source changes or environment-variable updates require a new backend deployment.

When updating Cloudinary environment variables:

1. Save the values in Render.
2. Allow automatic deployment to start.
3. Verify that deployment completes successfully.
4. Test backend health.
5. Test Cloudinary health.
6. Test an authenticated image upload.

### Frontend deployment — GitHub Pages

The current frontend already points to the production Render backend through:

`src/config/api.js`

A GitHub Pages redeployment is not necessary when only Cloudinary credentials are changed in Render.

When frontend source code changes, push the changes to the configured GitHub branch. The GitHub Actions workflow automatically builds and deploys the frontend.

Deployment workflow:

`.github/workflows/deploy.yml`

---

## 14. Security Recommendations

- Keep Cloudinary API secrets exclusively on the backend.
- Never hardcode credentials in React components.
- Never commit `.env` files containing real secrets.
- Store production credentials in Render environment variables.
- Protect image-upload routes with administrator authentication.
- Validate actual image signatures, not only file extensions.
- Use secure HTTPS URLs for permanent blog image references.
- Avoid sharing JWT tokens or Cloudinary credentials in public logs.
- Rotate exposed Cloudinary API secrets when necessary.

Useful resources:

- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Status](https://status.cloudinary.com)
- [Render Dashboard](https://dashboard.render.com)
- [Render Documentation](https://render.com/docs)

---

## 15. Final Deployment Checklist

### Cloudinary configuration

- [ ] Cloudinary account is active.
- [ ] Cloud name is correct.
- [ ] API key is configured.
- [ ] API secret is configured.
- [ ] `qa_portfolio_preset` exists and is compatible with the upload implementation.

### Render backend

- [ ] Cloudinary environment variables are saved.
- [ ] Latest backend deployment is successful.
- [ ] Backend health endpoint returns HTTP 200.
- [ ] MongoDB connection is healthy.
- [ ] Cloudinary health endpoint returns HTTP 200.
- [ ] Upload route is available.
- [ ] Administrator authentication is working.

### Image upload

- [ ] Administrator can select an image.
- [ ] Original image selection limit is 50 MB.
- [ ] Images larger than 10 MB display a warning toast.
- [ ] The warning does not block image compression.
- [ ] Frontend image compression works.
- [ ] Compressed image does not exceed 5 MiB.
- [ ] Unsupported images are rejected.
- [ ] Upload progress is displayed.
- [ ] Upload completes within the configured timeout.
- [ ] Cloudinary returns an HTTPS image URL.
- [ ] Blog record is saved successfully.
- [ ] Uploaded image displays correctly on the live portfolio.

### GitHub Pages

- [ ] Production frontend uses the correct Render API URL.
- [ ] GitHub Actions deployment is successful after frontend changes.
- [ ] Live blog administration functions correctly.

---

## 16. Final Architecture Summary

| Component | Current implementation |
|---|---|
| Frontend hosting | GitHub Pages |
| Backend hosting | Render |
| Backend framework | Express |
| Database | MongoDB Atlas |
| Image storage | Cloudinary |
| Upload endpoint | `POST /api/blogs/upload` |
| Upload authentication | Administrator JWT |
| Frontend compression | JPEG, quality 0.75 |
| Maximum resize width | 1920 pixels |
| Original frontend file limit | 50 MB |
| Frontend large-file warning | Non-blocking toast for original files larger than 10 MB |
| Backend file limit | 5 MiB |
| Backend accepted image types | JPEG, PNG, WebP |
| Backend temporary storage | Multer memory storage |
| Frontend upload timeout | 5 minutes |
| Backend request/response timeout | 5 minutes |
| Upload progress | 5–90%, then 100% on successful response |
| Permanent image URL | Cloudinary HTTPS URL |
| Blog record storage | MongoDB |

**Final result:** The administrator selects an image through the React interface. The frontend validates the original file, displays a warning toast for files larger than 10 MB without blocking compression, and compresses the image. The authenticated Render backend validates the compressed image against its 5 MiB limit, uploads it to Cloudinary, and the resulting secure image URL is saved with the blog record in MongoDB.

**Precision in Every Detail. Quality in Every Release.**

© Sumit Panchal | Quality Assurance Portfolio