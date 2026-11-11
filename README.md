<div align="center">

# Sumit Panchal - QA Portfolio

</div>

<div align="center">

A professional Manual QA portfolio showcasing software testing expertise, practical QA projects, and a quality-driven approach to building reliable digital experiences.

[![Live Portfolio](https://img.shields.io/badge/LIVE%20PORTFOLIO-VISIT%20WEBSITE-ff0000?style=flat-square&logo=googlechrome&logoColor=white)](https://lifeofthecoders.github.io/Sumit-Panchal-QA-Portfolio/)
[![React](https://img.shields.io/badge/React-18-087ea4?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-API-555555?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-555555?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Render](https://img.shields.io/badge/Render-Backend%20Hosting-46E3B7?style=flat-square&logo=render&logoColor=black)](https://render.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Storage-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)


**Designed and developed by [Sumit Panchal](https://github.com/lifeofthecoders).**


</div>



[Overview](#-project-overview) · [Features](#-key-features) · [Technology](#-technology-stack) · [Architecture](#-application-architecture) · [Project Structure](#-project-structure) · [Setup](#-getting-started) · [Authentication](#-jwt-authentication--administrator-workflow) · [Database](#-mongodb-database-integration) · [Deployment](#-deployment-architecture) · [License](#-license--ownership)

---

## 🎯 Project Overview

The **Sumit Panchal QA Portfolio** is a responsive, full-stack professional portfolio designed to showcase my experience, technical capabilities, practical QA work, and commitment to software quality.

The application combines a modern React-based frontend with a dedicated Node.js and Express backend. It uses MongoDB for persistent data storage and provides an administrator interface for managing portfolio content and blog information.

The project follows a separated frontend–backend architecture, allowing the user-facing portfolio and backend services to be developed, maintained, and deployed independently.

The public website is hosted on GitHub Pages, while the backend API is deployed on Render. MongoDB Atlas provides the cloud database, and Cloudinary handles image hosting and media uploads.

**Project Objective:** Build a professional, maintainable, and scalable portfolio experience that presents QA expertise while demonstrating practical full-stack application development and deployment.

---

## ✨ Key Features

| Area | Description |
|---|---|
| Professional Portfolio | Responsive presentation of profile, QA expertise, projects, and professional information |
| Project Showcase | Dedicated presentation of QA projects and supporting visual materials |
| Blog Management | Create, view, update, and delete blog content through backend APIs |
| Admin Authentication | Administrator login using JSON Web Token (JWT) authentication |
| Admin Dashboard | Interface for managing portfolio administration features |
| Admin Profile | View and update administrator profile information |
| Password Management | Authenticated password change functionality |
| Image Uploads | Upload blog and profile images using Multer and Cloudinary |
| Database Integration | Persistent storage using MongoDB and Mongoose |
| API Integration | Communication between frontend and backend through REST API endpoints |
| Health Monitoring | Backend, database, and Cloudinary health-check endpoints |
| Responsive Design | User interface adapted for desktop, tablet, and mobile screens |
| Cloud Deployment | Frontend and backend hosted independently |

---

## 🏗️ Application Architecture

The application follows a **separated frontend and backend architecture**.

The frontend handles the user interface, navigation, portfolio presentation, and administrator interactions. The backend provides API endpoints, authentication, database operations, and media-upload services.

### High-Level Architecture

```text
                  VISITORS / ADMINISTRATOR
                            |
                            v
                 REACT FRONTEND APPLICATION
                     (Vite + React)
                            |
                     REST API Requests
                            |
                            v
                 NODE.JS + EXPRESS SERVER
                       (Render)
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
        JWT AUTH        API ROUTES      MEDIA UPLOAD
        SERVICE         & CONTROLLERS    SERVICE
             |              |              |
             v              v              v
       ADMIN ACCESS     MONGOOSE        CLOUDINARY
             |              |
             |              v
             |         MONGODB ATLAS
             |              |
             +--------------+
```

### Frontend Responsibilities

The frontend is responsible for:

- Rendering the public portfolio and its sections.
- Providing navigation and responsive layouts.
- Displaying projects, blog content, and profile information.
- Handling administrator login and dashboard interactions.
- Sending API requests to the backend.
- Displaying API responses and validation feedback.
- Managing the user interface for profile and content operations.

### Backend Responsibilities

The backend is responsible for:

- Exposing REST API endpoints through Express.js.
- Validating administrator login credentials.
- Generating and verifying JWT authentication tokens.
- Protecting administrator-specific endpoints with authentication middleware.
- Reading and writing portfolio data through Mongoose.
- Managing blog-related API operations.
- Handling image uploads and Cloudinary integration.
- Providing database and service health checks.
- Managing server-side errors and API responses.

---

## 🧰 Technology Stack

### Frontend - Client Application

| Technology | Purpose |
|---|---|
| React 18 | Component-based user interface development |
| Vite 5 | Development server and production build tooling |
| JavaScript (ES Modules) | Application logic |
| React Router DOM | Client-side routing and navigation |
| CSS3 | Layout, styling, responsive design, and animations |
| React Icons | Icon library |
| React Quill | Rich-text editing interface |
| UUID | Unique identifier generation |

### Backend - Server Application

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime environment |
| Express.js | Backend web framework and REST API |
| Mongoose | MongoDB object data modeling |
| JSON Web Token (JWT) | Administrator authentication |
| bcryptjs | Password hashing and comparison |
| Multer | Multipart file upload handling |
| Cloudinary | Cloud-based image storage and delivery |
| Nodemailer | Email integration |
| CORS | Cross-origin request configuration |
| dotenv | Environment variable management |
| Cookie Parser | Cookie parsing middleware |

### Database & Cloud Services

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Mongoose | Database schemas, models, and queries |
| Render | Backend API hosting |
| GitHub Pages | Frontend website hosting |
| GitHub Actions | Automated frontend build and deployment |
| Cloudinary | Image upload, storage, and delivery |

### Development Tools

- Git and GitHub - Source control and version management.
- Visual Studio Code - Development environment.
- npm - Package and dependency management.
- Postman / API clients - API testing and verification.
- Browser Developer Tools - Frontend debugging and network inspection.

---

## 📁 Project Structure

The repository is organized into separate frontend and backend areas.

```text
Sumit-Panchal-QA-Portfolio/
│
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Pages deployment workflow
│
├── backend/                           # Node.js + Express backend
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── cloudinary.js           # Cloudinary configuration
│   │   │
│   │   ├── controllers/
│   │   │   └── adminAuth.controller.js # Admin authentication and profile logic
│   │   │
│   │   ├── middlewares/
│   │   │   ├── adminAuth.js            # JWT verification middleware
│   │   │   ├── requireDatabase.js      # Database availability checks
│   │   │   └── uploadBlogImage.js      # Image upload middleware
│   │   │
│   │   ├── models/
│   │   │   ├── Admin.js                # Administrator schema
│   │   │   └── Blog.js                 # Blog schema
│   │   │
│   │   ├── routes/
│   │   │   ├── adminAuth.route.js      # Admin authentication routes
│   │   │   └── blogs.js                # Blog API routes
│   │   │
│   │   └── utils/
│   │       ├── adminFallback.js        # Fallback administrator utilities
│   │       └── sendMail.js             # Email utility
│   │
│   ├── scripts/
│   │   ├── test_cloudinary_health.sh   # Cloudinary health testing
│   │   ├── test_upload_base64.js       # Base64 upload testing
│   │   └── test_upload_multipart.sh    # Multipart upload testing
│   │
│   ├── uploads/                        # Local upload fallback directory
│   ├── public/
│   │   └── image/                      # Backend-served default images
│   │
│   ├── server.js                       # Express server entry point
│   ├── package.json                    # Backend dependencies and scripts
│   └── .env                            # Backend environment variables (not committed)
│
├── public/                             # Frontend static assets
│   ├── image/
│   ├── project/
│   └── ...
│
├── src/                                # React frontend source
│   │
│   ├── admin/                          # Administrator interface
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminProfile.jsx
│   │
│   ├── assets/
│   │   ├── css/                        # Component and page styles
│   │   └── ...
│   │
│   ├── components/                     # Reusable UI components
│   ├── config/
│   │   └── api.js                      # Centralized backend API configuration
│   │
│   ├── services/                       # Frontend API service modules
│   ├── App.jsx                         # Main application component
│   └── main.jsx                        # React application entry point
│
├── .gitignore
├── DEPLOYMENT_CHECKLIST.md
├── IMAGE_PERMANENCE_FIX.md
├── UPLOAD_TIMEOUT_FIX.md
├── eslint.config.js
├── index.html
├── package.json                        # Frontend dependencies and scripts
├── package-lock.json
├── vite.config.js                      # Vite configuration and API proxy
└── README.md
```

*Note: This tree highlights the principal application files and directories. Additional components, assets, and service modules may be present as the project evolves.*

---

## 🗄️ MongoDB Database Integration

The application uses **MongoDB Atlas** as its cloud database and Mongoose as the object data modeling (ODM) library.

MongoDB stores application information in collections, while Mongoose provides schemas, validation, and database query functionality.

### Main Data Models

| Model | Responsibility |
|---|---|
| Admin | Administrator identity, credentials, profile details, roles, login attempts, and session-related information |
| Blog | Blog content and associated information, including image URLs and timestamps |

### How Database Integration Works

1. The backend starts and loads its environment configuration.
2. Mongoose attempts to connect to MongoDB Atlas using `MONGODB_URI`.
3. If the Atlas connection is unavailable, the configured local MongoDB fallback can be attempted.
4. Once connected, the backend can process database-dependent requests.
5. API controllers use Mongoose models to read, create, update, and delete records.
6. The backend returns JSON responses to the frontend.

### Database Health Check

The backend exposes:

```http
GET /api/health
```

This endpoint reports backend and MongoDB connection readiness.

A successful response indicates that the backend is running and the database connection is established.

---

## 🔐 JWT Authentication & Administrator Workflow

Administrator authentication is implemented using **JSON Web Tokens (JWT)** and password hashing with bcryptjs.

JWT provides a way for the backend to verify the identity and authorization context of an administrator when accessing protected endpoints.

### Authentication Workflow

```text
        ADMIN OPENS LOGIN PAGE
                  |
                  v
        ENTERS EMAIL & PASSWORD
                  |
                  v
          FRONTEND SENDS REQUEST
          POST /api/admin/login
                  |
                  v
          EXPRESS AUTH CONTROLLER
                  |
                  v
        VALIDATE ADMIN CREDENTIALS
                  |
                  v
        VERIFY PASSWORD USING BCRYPT
                  |
                  v
          GENERATE SIGNED JWT
                  |
                  v
          RETURN TOKEN TO CLIENT
                  |
                  v
        CLIENT SENDS BEARER TOKEN
        WITH PROTECTED API REQUESTS
                  |
                  v
        JWT AUTHENTICATION MIDDLEWARE
                  |
                  v
          VERIFY TOKEN & ADMIN
                  |
                  v
         ALLOW OR REJECT REQUEST
```

### JWT Authentication Details

- The administrator submits login credentials through the frontend.
- The backend checks the administrator account and validates the password.
- Password verification uses bcryptjs.
- After successful authentication, the backend generates a signed JWT.
- The token contains administrator identification, role, and token-version information.
- The token has a configured seven-day expiration.
- Protected requests provide the token using the `Authorization: Bearer` header.
- The backend authentication middleware verifies the token before allowing protected administrator operations.
- Token-version checks help invalidate existing sessions after password changes.

### Administrator API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/admin/login` | Authenticate administrator |
| GET | `/api/admin/profile` | Retrieve authenticated administrator profile |
| PUT | `/api/admin/profile` | Update administrator profile |
| PUT | `/api/admin/change-password` | Change administrator password |
| POST | `/api/admin/logout` | Log out and clear the authentication cookie |

**Security note:** JWT secrets and database credentials must be configured through server-side environment variables. Never expose private secrets in frontend source code or commit them to GitHub.

---

## 🔄 Frontend & Backend Communication

The frontend and backend communicate through HTTP-based REST API requests.

The frontend uses a centralized API configuration file:

```text
src/config/api.js
```

This keeps the backend host configuration in one place instead of repeating the production URL across multiple frontend files.

### Local Development

During local development, Vite provides a proxy for API requests.

```text
React Frontend
localhost:5173
      |
      v
Vite Development Proxy
      |
      v
Express Backend
localhost:5000
      |
      v
MongoDB
```

### Production Environment

The production frontend communicates directly with the deployed Render backend.

```text
GitHub Pages Frontend
        |
        v
Production API Configuration
        |
        v
Render Backend API
        |
        v
MongoDB Atlas
```

### Production URLs

| Service | URL |
|---|---|
| Live Portfolio | https://lifeofthecoders.github.io/Sumit-Panchal-QA-Portfolio/ |
| Backend API | https://sumit-panchal-qa-portfolio-1h3z.onrender.com |
| Backend Health | https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/health |
| Cloudinary Health | https://sumit-panchal-qa-portfolio-1h3z.onrender.com/api/cloudinary-health |

---

## 🖼️ Cloudinary Image Management

Cloudinary is integrated to manage uploaded images without relying exclusively on the backend server's local filesystem.

The upload workflow uses:

- Multer for handling incoming multipart file uploads.
- Cloudinary for cloud-based image storage.
- Backend upload routes for processing and returning image URLs.
- MongoDB for storing the relevant image URL with application content.

### Upload Workflow

1. The administrator selects an image.
2. The frontend sends the image to the backend.
3. Multer processes the incoming file.
4. The backend validates the upload and checks Cloudinary configuration.
5. The image is uploaded to Cloudinary.
6. Cloudinary returns a secure image URL.
7. The backend returns the URL to the frontend.
8. The application can use the returned URL when saving or displaying content.

The backend also provides a Cloudinary health endpoint:

```http
GET /api/cloudinary-health
```

---

## ⚙️ Getting Started

### Prerequisites

Install the following tools before starting:

- Node.js - supported LTS version.
- npm - included with Node.js.
- Git - for repository management.
- MongoDB Atlas account - for cloud database access.
- Cloudinary account - for image hosting.

### 1. Clone the Repository

```bash
git clone https://github.com/lifeofthecoders/Sumit-Panchal-QA-Portfolio.git

cd Sumit-Panchal-QA-Portfolio
```

### 2. Install Frontend Dependencies

```bash
npm ci
```

### 3. Install Backend Dependencies

```bash
cd backend

npm install
```

### 4. Configure Backend Environment Variables

Create a `.env` file inside the `backend/` directory.

Example configuration:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_atlas_connection_string
LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/qa_portfolio

JWT_SECRET=your_long_random_secret_at_least_32_characters

CORS_ORIGIN=http://localhost:5173,https://lifeofthecoders.github.io

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Configure additional environment variables if required by your email integration.

**Important:** Replace the example values with your own credentials. Never commit `.env` files, MongoDB connection strings, JWT secrets, or Cloudinary API secrets.

### 5. Start the Backend

From the `backend/` directory:

```bash
npm run dev
```

The backend will normally run at:

```text
http://localhost:5000
```

### 6. Start the Frontend

Open a second terminal in the project root:

```bash
npm run dev
```

Vite will display the local frontend address, normally:

```text
http://localhost:5173
```

### 7. Build for Production

From the project root:

```bash
npm run build
```

The production-ready frontend files are generated in:

```text
dist/
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🚀 Deployment Architecture

The application uses separate hosting services for the frontend and backend.

### Frontend - GitHub Pages

The React/Vite application is built into static production assets and published through GitHub Pages.

The repository includes a GitHub Actions workflow:

```text
.github/workflows/deploy.yml
```

The workflow builds the frontend and deploys the generated `dist/` directory.

**Live frontend:**

https://lifeofthecoders.github.io/Sumit-Panchal-QA-Portfolio/

### Backend - Render

The Express backend is deployed as a separate Render web service.

| Setting | Configuration |
|---|---|
| Service | Render Web Service |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Runtime | Node.js |
| Database | MongoDB Atlas |
| Deployment | Automatic deployment from GitHub commits affecting the backend service |

### MongoDB - Atlas

MongoDB Atlas provides the cloud database used by the deployed backend.

The backend connects to Atlas using the `MONGODB_URI` environment variable configured in Render.

### Deployment Flow

```text
        DEVELOPER PUSHES CODE
                 |
                 v
              GITHUB
                 |
          +------+------+
          |             |
          v             v
     FRONTEND         BACKEND
     WORKFLOW         CHANGES
          |             |
          v             v
     VITE BUILD      RENDER BUILD
          |             |
          v             v
     GITHUB PAGES    RENDER SERVER
          |             |
          |             v
          |        MONGODB ATLAS
          |             |
          +------ API --+
```

Frontend-only changes are deployed through the GitHub Actions workflow. Backend changes are deployed through the Render service configuration.

---

## 🔌 API Overview

The backend exposes REST API endpoints for administrator authentication, blog operations, and service health monitoring.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Backend and database health |
| GET | `/api/cloudinary-health` | Cloudinary connection health |
| POST | `/api/admin/login` | Administrator login |
| GET | `/api/admin/profile` | Get administrator profile |
| PUT | `/api/admin/profile` | Update administrator profile |
| PUT | `/api/admin/change-password` | Change administrator password |
| POST | `/api/admin/logout` | Administrator logout |
| GET | `/api/blogs` | Retrieve paginated blog records |
| GET | `/api/blogs/:id` | Retrieve a blog by ID |
| POST | `/api/blogs` | Create a blog record |
| PUT | `/api/blogs/:id` | Update a blog record |
| DELETE | `/api/blogs/:id` | Delete a blog record |
| POST | `/api/blogs/upload` | Upload a blog image |

Protected administrator endpoints require a valid JWT in the authorization header.

---

## 🛡️ Security & Configuration Practices

The application uses several backend security-related mechanisms:

- JWT verification for protected administrator operations.
- bcryptjs for password hashing and comparison.
- Environment variables for deployment configuration.
- CORS configuration for cross-origin frontend requests.
- Mongoose schemas and validation.
- Login-attempt tracking and account-locking logic in the administrator model.
- Token-version checks to support session invalidation.
- Password exclusion from standard administrator query results.
- Server-side validation and centralized error handling.

### Environment Variable Guidelines

- Keep the backend `.env` file out of version control.
- Use a strong, randomly generated JWT secret.
- Keep MongoDB credentials private.
- Keep Cloudinary API secrets private.
- Configure production environment variables in Render.
- Never place backend secrets in Vite `VITE_` variables.
- Rotate any credential that may have been exposed.

---

## 🧪 Quality & Verification

The application can be verified at both the frontend and backend levels.

### Frontend Verification

- Validate responsive layouts and navigation.
- Verify route transitions and user interactions.
- Check API integration and error handling.
- Verify that the correct production API host is used.
- Test portfolio content and image rendering.

### Backend Verification

- Check backend health and MongoDB connectivity.
- Validate administrator login and JWT verification.
- Test protected administrator endpoints.
- Verify blog CRUD operations.
- Test profile updates and password changes.
- Validate image uploads and Cloudinary connectivity.
- Check error responses and unavailable-service behavior.

### Useful Verification Commands

```bash
# Build frontend
npm run build

# Check frontend linting
npm run lint

# Start backend in development mode
cd backend
npm run dev
```

---

## 💼 What I Bring to a Team

I focus on helping teams build software that is:

- Reliable
- Usable
- Consistent
- Stable
- User-friendly
- Functional
- Production-ready

I approach every feature with one question:

> **"How will a real user experience this?"**

---

## 🌐 Explore My Portfolio

🚀 [**Visit My Live QA Portfolio**](https://lifeofthecoders.github.io/Sumit-Panchal-QA-Portfolio/)

---

## 💼 Professional Focus

I'm interested in opportunities where I can contribute to building products that are:

**Reliable • Usable • Consistent • Stable • Scalable • User-Friendly**

I bring a QA mindset that focuses not only on whether a feature works, but also on **how the complete product behaves in the hands of a real user**.

My approach combines structured testing with real-world user behavior, helping identify defects, usability issues, edge cases, and potential risks before they reach the end user.

---

## 📄 License & Ownership

This project is a personal professional portfolio created for business and professional purposes.

All portfolio content, personal information, branding, project materials, images, designs, source code, and other original assets belong to the author unless otherwise stated.

Third-party libraries, frameworks, services, and assets remain subject to their respective licenses and terms of use.

Unauthorized copying, redistribution, modification, or commercial use of the original portfolio content and assets is not permitted without prior permission from the applicable rights holder.

---

## 📫 Connect With Me

If you'd like to connect, collaborate, or discuss QA and software testing, feel free to reach out.

**Sumit Panchal**  
**Quality Analyst | Manual QA | Software Testing**

<p align="center">
🌐 <strong>Portfolio:</strong>
<a href="https://lifeofthecoders.github.io/Sumit-Panchal-QA-Portfolio/">
https://lifeofthecoders.github.io/Sumit-Panchal-QA-Portfolio/
</a>
</p>

<p align="center">
💻 <strong>GitHub:</strong>
<a href="https://github.com/lifeofthecoders/Sumit-Panchal-QA-Portfolio">
https://github.com/lifeofthecoders/Sumit-Panchal-QA-Portfolio
</a>
</p>


---

## ⭐ Support
<p align="center">
If you find this portfolio useful, feel free to explore the project and give the repository a star ⭐.
</p>

<p align="center">
<strong>**QUALITY IS MY CRAFT.**<br>  
**RELIABILITY IS MY GOAL.**</strong>
</p>

<p align="center">
**HAPPY TESTING 😀**
</p>

---

