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
        />
        <label htmlFor="menu-toggle" className="hamburger" />

        <nav className={`nav-links nav ${open ? "open" : ""}`}>
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
