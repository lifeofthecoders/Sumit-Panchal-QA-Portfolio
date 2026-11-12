# Backend — MongoDB, Express & Cloudinary

**Project:** Sumit Panchal | Quality Assurance Portfolio  
**Backend:** Node.js + Express  
**Database:** MongoDB Atlas  
**Image Storage:** Cloudinary  
**Production Hosting:** Render  
**Local Development Port:** 5000

---

## 1. Overview

This directory contains the backend API for the Sumit Panchal Quality Assurance Portfolio.

The backend is responsible for:

- Serving blog data through REST API endpoints.
- Creating, updating, and deleting blog records.
- Connecting to MongoDB.
- Authenticating administrator requests.
- Validating uploaded blog images.
- Uploading images to Cloudinary.
- Returning secure HTTPS image URLs.
- Providing backend, database, and Cloudinary health checks.

### Application architecture

```text
React + Vite Frontend
        |
        v
Express REST API
        |
        +--------------------+
        |                    |
        v                    v
MongoDB Atlas             Cloudinary
        |                    |
        v                    v
Blog Records           Blog Images
```

The backend temporarily stores incoming image files in memory using Multer before uploading them to Cloudinary. Blog images are not permanently stored on the backend server.

---

## 2. Requirements

Make sure the following are installed:

- Node.js
- npm
- MongoDB local installation or a MongoDB Atlas account
- Cloudinary account for blog image uploads

Verify your Node.js and npm versions:

```bash
node --version
npm --version
```

---

## 3. Installation

Open a terminal in the project root directory.

Navigate to the backend:

```bash
cd backend
```

Install the dependencies:

```bash
npm install
```

---

## 4. Environment Configuration

Create your backend environment file using the provided example.

From the project root, copy:

```bash
cp backend/.env.example backend/.env
```

Alternatively, from inside the `backend` directory:

```bash
cp .env.example .env
```

For Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and configure the required environment variables.

### MongoDB configuration

For a local MongoDB instance:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/qa_portfolio
```

For MongoDB Atlas, use your actual Atlas connection string instead.

### CORS configuration

For local Vite frontend development:

```env
CORS_ORIGIN=http://localhost:5173
```

### Cloudinary configuration

Cloudinary credentials are required for blog image uploads.

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

The backend loads these values through:

`src/config/cloudinary.js`

The blog image upload route uses the following Cloudinary upload preset:

```text
qa_portfolio_preset
```

**Important:** Retain and configure any additional variables already defined in `.env.example`. Do not remove required project configuration when preparing your local `.env` file.

### Security

- Never commit `backend/.env` to GitHub.
- Never expose Cloudinary API secrets.
- Never put backend credentials in frontend code.
- Use environment variables for production credentials.
- Keep `.env.example` limited to placeholder values.

---

## 5. Run the Backend

Make sure your local MongoDB service is running, or that your MongoDB Atlas connection is configured correctly.

From the `backend` directory, start the development server:

```bash
npm run dev
```

The backend runs locally at:

```text
http://localhost:5000
```

The API base URL is:

```text
http://localhost:5000/api
```

---

## 6. API Endpoints

### Blog APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blogs` | Retrieve blog records |
| GET | `/api/blogs/:id` | Retrieve a blog by ID |
| POST | `/api/blogs` | Create a blog |
| PUT | `/api/blogs/:id` | Update an existing blog |
| DELETE | `/api/blogs/:id` | Delete a blog |
| POST | `/api/blogs/upload` | Upload a blog image to Cloudinary |

The blog creation, update, deletion, and image upload operations are intended for administrator functionality. Follow the authentication requirements enforced by the corresponding backend routes.

### Blog image upload

Endpoint:

```http
POST /api/blogs/upload
```

Authentication:

```http
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Request content type:

```text
multipart/form-data
```

Form-data field:

```text
image
```

The endpoint:

1. Verifies administrator authentication.
2. Validates the uploaded image.
3. Checks the file's MIME type and binary signature.
4. Enforces the 5 MiB backend upload limit.
5. Uploads the image to Cloudinary.
6. Returns the secure image URL and Cloudinary public ID.

Example successful response:

```json
{
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/...",
  "public_id": "your-cloudinary-public-id"
}
```

**Important:** The project uses `/api/blogs/upload` for actual image uploads. A `/api/blogs/upload-test` endpoint is not implemented.

---

## 7. Image Upload Validation

The upload middleware is located at:

`src/middlewares/uploadBlogImage.js`

The backend currently applies these restrictions:

| Setting | Configuration |
|---|---|
| Maximum file size | 5 MiB |
| Maximum files per request | 1 |
| Maximum multipart fields | 10 |
| Maximum multipart parts | 11 |
| Accepted MIME types | JPEG, PNG, WebP |
| Image signature validation | Enabled |
| Temporary upload storage | Multer memory storage |

The frontend performs image validation and compression before sending the image to the backend.

### Frontend and backend size limits

| Validation stage | Limit / Behavior |
|---|---|
| Original frontend image selection | 50 MB |
| Large original image warning | Non-blocking warning toast above 10 MB |
| Maximum frontend resize width | 1920 pixels |
| JPEG compression quality | 0.75 |
| Backend upload limit | 5 MiB |

The 10 MB warning does not prevent compression or reject the original image.

The backend independently enforces its 5 MiB limit against the compressed file it receives.

**Note:** GIF images selected in the frontend are converted to JPEG during compression, so GIF animation is not preserved.

---

## 8. Health Check Endpoints

The backend provides health endpoints to verify service availability.

### Backend and database health

Endpoint:

```http
GET /api/health
```

Local URL:

```text
http://localhost:5000/api/health
```

Production URL:

https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/health

Example healthy response:

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

This endpoint checks backend availability and MongoDB connectivity.

### Cloudinary health

Endpoint:

```http
GET /api/cloudinary-health
```

Local URL:

```text
http://localhost:5000/api/cloudinary-health
```

Production URL:

https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/cloudinary-health

Example successful response:

```json
{
  "ok": true,
  "message": "Cloudinary connected successfully"
}
```

This endpoint performs a Cloudinary connectivity check.

A successful health check confirms connectivity, but an actual authenticated image upload is still necessary to verify the complete upload workflow.

---

## 9. Timeout Configuration

The current project uses a five-minute timeout for image-upload requests.

### Backend timeout

File:

`server.js`

Current timeout configuration:

```js
app.use((req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
});
```

Configuration:

```text
300000 milliseconds = 5 minutes
```

The frontend also has its own five-minute upload timeout in:

`../src/services/blogService.js`

**Important:** Frontend and backend timeout settings are configured separately. External hosting infrastructure or proxies may also impose their own limits.

---

## 10. Production Deployment — Render

The production backend is hosted on Render.

Production API base URL:

```text
https://sumit-panchal-qa-portfolio-1h3z.onrender.com
```

### Deployment steps

1. Open the Render Dashboard.
2. Select the QA Portfolio backend service.
3. Verify the connected GitHub repository and branch.
4. Open the Environment section.
5. Configure the required production environment variables.
6. Save the configuration.
7. Allow the backend deployment to complete.
8. Review the deployment logs.
9. Test the backend health endpoint.
10. Test Cloudinary connectivity.
11. Perform an authenticated blog image upload.

### Production environment variables

Configure the appropriate values in the Render Environment section.

The Cloudinary variables are:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Also configure the required MongoDB, CORS, and other application variables from the backend environment configuration.

Do not commit actual production secrets to the repository.

---

## 11. Local API Testing

Start the backend:

```bash
cd backend
npm run dev
```

Test backend health:

```bash
curl -i http://localhost:5000/api/health
```

Test Cloudinary health:

```bash
curl -i http://localhost:5000/api/cloudinary-health
```

Retrieve blogs:

```bash
curl -i http://localhost:5000/api/blogs
```

Retrieve an individual blog:

```bash
curl -i http://localhost:5000/api/blogs/YOUR_BLOG_ID
```

For administrator-protected endpoints, use a valid administrator JWT as required by the corresponding route.

---

## 12. Troubleshooting

### MongoDB connection failed

Check:

- MongoDB service is running for local development.
- `MONGODB_URI` is correct.
- MongoDB Atlas network access permits the connection.
- Database credentials are valid.

### Backend is not starting

Check:

- Node.js and npm are installed.
- Backend dependencies are installed.
- `.env` exists and contains valid values.
- The configured port is available.
- Terminal output and backend startup logs.

### Cloudinary connection failed

Check:

- `CLOUDINARY_CLOUD_NAME` is configured.
- `CLOUDINARY_API_KEY` is configured.
- `CLOUDINARY_API_SECRET` is configured.
- The Cloudinary account is accessible.
- The upload preset `qa_portfolio_preset` exists and is compatible with the upload implementation.

### Image exceeds the maximum allowed size

The backend enforces a 5 MiB upload limit.

Try:

1. Selecting a smaller original image.
2. Reducing the image dimensions.
3. Allowing frontend compression to finish.
4. Confirming the compressed image does not exceed 5 MiB.
5. Retrying the upload.

### Administrator authentication failed

Check:

- The administrator is signed in.
- The JWT is valid.
- The Authorization header is correctly supplied.
- The token has not expired or been invalidated.

### Upload timed out

Check:

- Internet upload speed.
- Compressed image size.
- Render backend availability.
- Cloudinary connectivity.
- Backend logs.

The current application-level frontend and backend upload timeout is five minutes.

---

## 13. Project Structure

The important backend files include:

```text
backend/
│
├── src/
│   ├── config/
│   │   └── cloudinary.js
│   │
│   ├── controllers/
│   │
│   ├── middlewares/
│   │   └── uploadBlogImage.js
│   │
│   ├── models/
│   │
│   ├── routes/
│   │   └── blogs.js
│   │
│   └── utils/
│
├── .env.example
├── .env
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

This is a reference to the main backend areas responsible for configuration, routing, validation, and data handling.

---

## 14. Security Recommendations

- Never commit `.env` files containing actual credentials.
- Keep Cloudinary API secrets on the backend.
- Use administrator authentication for protected operations.
- Validate image MIME types and actual binary signatures.
- Enforce backend file-size restrictions.
- Use HTTPS for production image URLs.
- Do not expose administrator JWTs in public logs or screenshots.
- Keep production environment variables configured through Render.
- Rotate API secrets if they are accidentally exposed.

---

## 15. Final Backend Configuration Summary

| Component | Current configuration |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Local backend URL | `http://localhost:5000` |
| Production hosting | Render |
| Production backend URL | `https://sumit-panchal-qa-portfolio-1h3z.onrender.com` |
| Database | MongoDB Atlas |
| Image storage | Cloudinary |
| Cloudinary preset | `qa_portfolio_preset` |
| Upload endpoint | `POST /api/blogs/upload` |
| Upload authentication | Administrator JWT |
| Frontend original image limit | 50 MB |
| Frontend warning threshold | Above 10 MB |
| Backend upload limit | 5 MiB |
| Backend accepted image types | JPEG, PNG, WebP |
| Temporary upload storage | Multer memory storage |
| Backend request/response timeout | 5 minutes |

---

**Precision in Every Detail. Quality in Every Release.**

© Sumit Panchal | Quality Assurance Portfolio