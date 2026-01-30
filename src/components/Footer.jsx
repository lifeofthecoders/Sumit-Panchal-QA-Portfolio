import React from "react";
import { FaLinkedinIn, FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import "../assets/css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Left Side */}
      <div className="footer-left">
        © 2025 Sumit Panchal. All rights reserved.
      </div>

      {/* Right Side */}
      <div className="footer-right">
        <span className="footer-follow-text">Follow Us</span>

        <a href="https://www.linkedin.com/in/sumit-panchal-b790a8236/" target="_blank" rel="noreferrer">
          <FaLinkedinIn />
        </a>

        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          <FaInstagram />
        </a>

        <a href="https://facebook.com" target="_blank" rel="noreferrer">
          <FaFacebookF />
        </a>

        <a href="https://youtube.com" target="_blank" rel="noreferrer">
          <FaYoutube />
        </a>

      </div>
    </footer>
  );
};

export default Footer;
