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

        {/* GitHub */}
        <a
          href="https://github.com/lifeofthecoders"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <FaGithub />
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/sumit-panchal-b790a8236/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedinIn />
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/workhard2livelarge?igsh=MmM0YmZvNHc0bDZ2"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>

        {/* Facebook */}
        <a
          href="https://www.facebook.com/share/1BxMxaQsV8/"
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
        >
          <FaFacebookF />
        </a>

        {/* Quora */}
        <a
          href="https://www.quora.com/profile/Sumit-Panchal-345"
          target="_blank"
          rel="noreferrer"
          aria-label="Quora"
        >
          <FaQuora />
        </a>

        {/* Youtube */}
        <a href="https://youtube.com"
        target="_blank"
        rel="noreferrer"
        aria-label="YouTube"
        > 
          <FaYoutube /> 
        </a> 

        {/* Behance */}  
        <a href="https://www.behance.net/"
        target="_blank"
        rel="noreferrer"
        aria-label="Behance"
        >
           <FaBehance />
        </a>

        {/* Dribbble */}
        <a href="https://dribbble.com/"
        target="_blank"
        rel="noreferrer"
        aria-label="Dribbble"
        >
           <FaDribbble />
        </a>
        
        {/* X Twitter */}
        <a href="https://x.com/"
        target="_blank"
        rel="noreferrer"
        aria-label="XTwitter"
        > 
            <FaXTwitter />
        </a>

      </div>
    </footer>
  );
};

export default Footer;
