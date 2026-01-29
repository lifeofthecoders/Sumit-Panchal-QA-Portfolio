import React from "react";
import "../assets/css/FollowUs.css";
import { FaLinkedinIn, FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

const FollowUs = () => {
    return (
        <div className="follow-wrapper">
            <span className="follow-text">Follow Us</span>

            <a href="https://youtube.com" target="_blank" rel="noreferrer">
                <FaYoutube />
            </a>

            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                <FaLinkedinIn />
            </a>

            <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <FaInstagram />
            </a>

            <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <FaFacebookF />
            </a>
        </div>
    );
};

export default FollowUs;
