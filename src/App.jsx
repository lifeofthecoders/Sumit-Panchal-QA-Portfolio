import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToHash from "./components/ScrollToHash";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Portfolio from "./pages/Portfolio";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Sitemap from "./pages/Sitemap";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";

import AdminLogin from "./admin/AdminLogin";
import ProtectedRoute from "./admin/ProtectedRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import BlogList from "./admin/BlogList";
import BlogForm from "./admin/BlogForm";
import BlogView from "./admin/BlogView";
import AdminProfile from "./admin/AdminProfile";
import AdminSettings from "./admin/AdminSettings";

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Warm up Render free tier backend (prevents cold start delay)
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!baseUrl) return;

    fetch(`${baseUrl}/api/health`)
      .then(() => {})
      .catch(() => {});
  }, []);

  return (
    <>
      <ScrollToTop />
      <ScrollToHash />
      {!isAdminRoute && <Header />}
      <Outlet />
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />

          {/* ================= ADMIN LOGIN (public) ================= */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ================= PROTECTED ADMIN SECTION ================= */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard – landing page after login */}
            <Route index element={<AdminDashboard />} />           {/* /admin → dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} /> {/* /admin/dashboard */}

            {/* Blog Management */}
            <Route path="blogs" element={<BlogList />} />
            <Route path="blogs/add" element={<BlogForm />} />
            <Route path="blogs/edit/:id" element={<BlogForm />} />
            <Route path="blogs/view/:id" element={<BlogView />} />

            {/* Profile & Settings */}
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />

            {/* Catch-all for invalid admin sub-routes */}
            <Route path="*" element={<div>404 - Admin page not found</div>} />
          </Route>

          {/* Optional: global 404 for non-existing routes */}
          <Route path="*" element={<div>404 - Page not found</div>} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}