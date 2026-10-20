# Backend (MongoDB + Express)

## 1) Install
cd backend
npm install

## 2) Create .env
Copy backend/.env.example to backend/.env and set:

MONGODB_URI=mongodb://127.0.0.1:27017/qa_portfolio
CORS_ORIGIN=http://localhost:5173

## 3) Run backend
npm run dev

Backend runs at:
http://localhost:5000

## API
GET    /api/blogs
GET    /api/blogs/:id
POST   /api/blogs
PUT    /api/blogs/:id
DELETE /api/blogs/:id
