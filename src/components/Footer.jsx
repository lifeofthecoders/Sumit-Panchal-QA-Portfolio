import React from "react";
import { FaLinkedinIn, FaInstagram, FaFacebookF, FaYoutube, FaDribbble, FaBehance } from "react-icons/fa";
import "../assets/css/Footer.css";
import { FaXTwitter } from "react-icons/fa6";

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

        <a href="https://www.instagram.com/workhard2livelarge?igsh=MmM0YmZvNHc0bDZ2" target="_blank" rel="noreferrer">
          <FaInstagram />
        </a>

        <a href="https://www.facebook.com/share/1BxMxaQsV8/" target="_blank" rel="noreferrer">
          <FaFacebookF />
        </a>

        <a href="https://youtube.com" target="_blank" rel="noreferrer">
          <FaYoutube />
        </a>

        <a href="https://www.behance.net/" target="_blank" rel="noreferrer">
          <FaBehance />
        </a>

        <a href="https://dribbble.com/" target="_blank" rel="noreferrer">
          <FaDribbble />
        </a>

        <a href="https://x.com/" target="_blank" rel="noreferrer">
          <FaXTwitter />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
