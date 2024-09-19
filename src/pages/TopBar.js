import React from 'react';
import './styles.css';

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="logo">
        <h1>Cafe Menu</h1>
      </div>
      <nav className="nav-links">
        <a href="#home">Home</a>
        <a href="#menu">Menu</a>
        <a href="#orders">Orders</a>
        <a href="#contact">Contact Us</a>
      </nav>
    </div>
  );
};

export default TopBar;
