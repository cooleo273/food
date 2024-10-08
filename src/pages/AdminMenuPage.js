import React, { useState } from "react";
import axios from "axios";
import "./styles.css"; // Ensure the CSS file is imported
import { useNavigate } from "react-router-dom";

const AdminMenuPage = () => {
  const [cafeName, setCafeName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState(""); // New state for description
  const [category, setCategory] = useState(""); // New state for category
  const [photo, setPhoto] = useState(null);
 
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleAddMenu = async () => {
    if (
      !cafeName ||
      !itemName ||
      !itemPrice ||
      !itemDescription ||
      !category ||
      !photo
    ) {
      alert("Please fill in all fields and upload a photo");
      return;
    }

    const formData = new FormData();
    formData.append("cafe", cafeName);
    formData.append("name", itemName);
    formData.append("price", itemPrice);
    formData.append("description", itemDescription); // Add description to form data
    formData.append("category", category); // Add category to form data
    formData.append("photo", photo);

    try {
      const response = await axios.post(
        "https://food-server-seven.vercel.app/api/menu",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      alert("Menu item added successfully!");
      setCafeName("");
      setItemName("");
      setItemPrice("");
      setItemDescription(""); // Clear description field
      setCategory(""); // Clear category field
      setPhoto(null);
    } catch (error) {
      console.error("There was an error adding the menu item!", error);
    }
  };

  return (
    <div className="admin-menu-container">
      <h1 className="admin-menu-header">Admin Menu Page</h1>
      <div className="admin-menu-form">
        <select
          className="select-dropdown"
          value={cafeName}  
          onChange={(e) => setCafeName(e.target.value)}  
        >
          <option value="">Select a cafe</option> {/* Placeholder option */}
          <option value="Cambridge">Cambridge</option>
          <option value="Bingham">Bingham</option>
          <option value="Savor">Savor</option>
        </select>
        
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="admin-menu-input"
        />
        <input
          type="number"
          placeholder="Item Price"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          className="admin-menu-input"
        />
        <textarea
          placeholder="Item Description"
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          className="admin-menu-input"
        />
       <select
          className="select-dropdown"
          value={category}  
          onChange={(e) => setCategory(e.target.value)}  
        >
          <option value="">Select a category</option> {/* Add a placeholder option */}
          <option value="breakfast">Breakfast</option>
          <option value="main dish">Main Dish</option>
          <option value="dessert">Dessert</option>
          <option value="drinks">Drinks</option>
        </select>

        <input
          type="file"
          onChange={handleFileChange}
          className="admin-menu-file-input"
        />
        <button onClick={handleAddMenu} className="admin-menu-button">
          Add Menu Item
        </button>
        <button
          onClick={() => navigate("/admin/updatemenu")}
          className="admin-menu-button"
        >
          Update Menu
        </button>
      </div>
    </div>
  );
};

export default AdminMenuPage;
