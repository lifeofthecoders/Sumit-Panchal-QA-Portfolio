import { Routes, Route, Outlet, useLocation } from "react-router-dom";

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

import BlogList from "./admin/BlogList";
import BlogForm from "./admin/BlogForm";
import BlogView from "./admin/BlogView";

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      <ScrollToHash />
      {!isAdminRoute && <Header />}
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
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

        {/* Admin Routes */}
        <Route path="/admin/blogs" element={<BlogList />} />
        <Route path="/admin/blogs/add" element={<BlogForm />} />
        <Route path="/admin/blogs/edit/:id" element={<BlogForm />} />
        <Route path="/admin/blogs/view/:id" element={<BlogView />} />
      </Route>
    </Routes>
  );
}