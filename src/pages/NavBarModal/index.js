import React from 'react';
import './index.css'; // Import your CSS file for styling

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="navbar navtabs">
      <div className="tabs">
        {["breakfast", "lunch", "dessert", "drinks"].map((category) => (
          <button
            key={category}
            className={`tab-button ${activeTab === category ? "active" : ""}`}
            onClick={() => setActiveTab(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
