import { Routes, Route, Outlet } from "react-router-dom";
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

function Layout() {
  return (
    <>
      <ScrollToTop />
      <ScrollToHash />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/sitemap" element={<Sitemap />} />
      </Route>
    </Routes>
  );
}
