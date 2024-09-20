import React from 'react';
import './styles.css';
import img1 from "../assets/savor logo (2).png"

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="logo">
        <img src={img1} alt='dfoubds'/>
      </div>
      <nav className="nav-links">
        <a href="/">Menu</a>
        <a href="/about">About</a>
        <a href="/contact">Contact Us</a>
      </nav>
    </div>
  );
};

export default TopBar;
