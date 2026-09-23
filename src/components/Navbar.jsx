import { NavLink } from "react-router-dom";
import { navLinks } from "../data/navLinks";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="hero-header">
      <div className="top-bar">
        <NavLink to="/" className="logo-link logo-slide">
          <img src="/image/logo.jpg" className="site-logo" />
        </NavLink>

        <input
          type="checkbox"
          checked={open}
          onChange={() => setOpen(!open)}
          id="menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
        />
        <label
          htmlFor="menu-toggle"
          className={`hamburger ${open ? "open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
        />

        <nav className={`nav-links nav ${open ? "open" : ""}`}>
          <div className="mobile-menu-header">
            <NavLink to="/" className="mobile-logo-link" onClick={() => setOpen(false)}>
              <img src="/image/logo.svg" className="site-logo mobile-logo" alt="Logo" />
            </NavLink>
          </div>

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
