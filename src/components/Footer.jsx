
import React from "react";
import { Link } from "react-router-dom";
import {
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaDribbble,
  FaBehance,
  FaQuora,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "../assets/css/Footer.css";

const Footer = () => {
  const handleHomeClick = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer">
      {/* Left Side Part */}
      <div className="footer-left">
        © {new Date().getFullYear()} Sumit Panchal. All rights reserved.
      </div>

      {/* Center Part - Click to Go Home */}
      <div className="footer-center footer-morse-code">
        <Link
          to="/"
          onClick={handleHomeClick}
          aria-label="Return to homepage"
          title="Back to Home"
          className="footer-morse-link"
        >
          📡 ... ..- -- .. - / .--. .- -. -.-. .... .- .-.. 🛰️
        </Link>
      </div>

      {/* Right Side Part */}
      <div className="footer-right">
        <span className="footer-follow-text">Follow Us</span>

        <a
          href="https://github.com/lifeofthecoders"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <FaGithub />
        </a>

        <a
          href="https://www.linkedin.com/in/sumit-panchal-b790a8236/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedinIn />
        </a>

        <a
          href="https://www.instagram.com/workhard2livelarge?igsh=MmM0YmZvNHc0bDZ2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>

        <a
          href="https://www.facebook.com/share/1BxMxaQsV8/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebookF />
        </a>

        <a
          href="https://www.quora.com/profile/Sumit-Panchal-345"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Quora"
        >
          <FaQuora />
        </a>

        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <FaYoutube />
        </a>

        <a
          href="https://www.behance.net/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Behance"
        >
          <FaBehance />
        </a>

        <a
          href="https://dribbble.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Dribbble"
        >
          <FaDribbble />
        </a>

        <a
          href="https://x.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X Twitter"
        >
          <FaXTwitter />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
