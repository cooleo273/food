// TopBar.js
import React from 'react';
import './styles.css';
import img1 from "../assets/savor logo (2).png";

const TopBar = ({ toggleCart, cartCount }) => {
  return (
    <div className="top-bar">
      <div className="logo">
        <img src={img1} alt='Logo' />
      </div>
      <nav className="nav-links">
        
        <div className="cart-button-container">
          <button className="my-cart-button" onClick={toggleCart}>
            My Cart
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default TopBar;
