import { NavLink } from "react-router-dom";
import { navLinks } from "../data/navLinks";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showCloseIcon, setShowCloseIcon] = useState(false);

  const toggleMenu = () => {
    if (!open) {
      setOpen(true);
      window.setTimeout(() => setShowCloseIcon(true), 120);
      return;
    }

    setShowCloseIcon(false);
    setOpen(false);
  };

  return (
    <header className="hero-header">
      <div className="top-bar">
        <NavLink to="/" className="logo-link logo-slide">
          <img src="/image/logo.jpg" className="site-logo" />
        </NavLink>

        <button
          type="button"
          className={`hamburger ${open ? "is-open" : ""} ${showCloseIcon ? "show-close" : ""}`}
          onClick={toggleMenu}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        />

        <nav id="mobile-nav" className={`nav-links nav ${open ? "open" : ""}`}>
          {navLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
