import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";

const AdminUpdatePage = () => {
  const [menus, setMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState(""); // New state for description
  const [itemCategory, setItemCategory] = useState("");
  const fetchMenus = async () => {
    try {
      const response = await axios.get("https://food-server-seven.vercel.app/api/menu");
      setMenus(response.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleMenuSelect = (menuId) => {
    setSelectedMenuId(menuId);
    setSelectedItemId("");
    setItemName("");
    setItemPrice("");
    setItemDescription(""); 
    setItemCategory("")// Reset description when menu changes
  };

  const handleItemSelect = (itemId, name, price, description, category) => {
    setSelectedItemId(itemId);
    setItemName(name);
    setItemPrice(price);
    setItemDescription(description);
    setItemCategory(category) // Set the selected item's description
  };

  const handleUpdateItem = async () => {
    if (!selectedItemId || !itemName || !itemPrice || !itemDescription || !itemCategory) {
      alert("Please fill in all fields and select an item");
      return;
    }

    try {
      await axios.put(
        `https://food-server-seven.vercel.app/api/menu/${selectedMenuId}/${selectedItemId}`,
        {
          name: itemName,
          price: itemPrice,
          description: itemDescription,
          category: itemCategory, // Include description in the update request
        }
      );
      alert("Item updated successfully!");
      setItemName("");
      setItemPrice("");
      setItemDescription("");
      setItemCategory("") // Clear the form after updating
      fetchMenus();
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Error updating item");
    }
  };

  const handleDeleteItem = async (menuId, itemId) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await axios.delete(
          `https://food-server-seven.vercel.app/api/menu/${menuId}/${itemId}`
        );
        alert("Item deleted successfully");
        fetchMenus();
      } catch (error) {
        console.error("Error deleting menu item:", error);
        alert("Failed to delete the item");
      }
    }
  };

  return (
    <div className="admin-update-container">
      <h1 className="admin-update-header">Update Menu Items</h1>

      <div className="menu-selection">
        <h2>Select a Menu</h2>
        <div className="menu-select">
          {menus.map((menu) => (
            <button key={menu._id} onClick={() => handleMenuSelect(menu._id)}>
              {menu.cafe}
            </button>
          ))}
        </div>
      </div>

      {selectedMenuId && (
        <div className="item-selection">
          <h2>Select an Item to Update</h2>
          {menus
            .find((menu) => menu._id === selectedMenuId)
            ?.items.map((item) => (
              <div key={item._id} className="item">
                <span>
                  {item.name} - {item.price.toFixed(2)} ETB
                </span>
                <div className="button">
                  <button
                    onClick={() =>
                      handleItemSelect(item._id, item.name, item.price, item.description, item.category)
                    }
                  >
                    Update
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteItem(selectedMenuId, item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

{selectedItemId && (
  <div className="item-update-form">
    <h2>Update Item</h2>
    <input
      type="text"
      placeholder="Item Name"
      value={itemName}
      onChange={(e) => setItemName(e.target.value)}
      className="admin-update-input"
    />
    <input
      type="number"
      placeholder="Item Price"
      value={itemPrice}
      onChange={(e) => setItemPrice(e.target.value)}
      className="admin-update-input"
    />
    <textarea
      placeholder="Item Description"
      value={itemDescription}
      onChange={(e) => setItemDescription(e.target.value)}
      className="admin-menu-input"
    />
    <select
      value={itemCategory}
      onChange={(e) => setItemCategory(e.target.value)} // Add a category selection
      className="select-dropdown"
    >
      <option value="">Select Category</option>
      <option value="breakfast">Breakfast</option>
      <option value="Main Dish">Main Dish</option>
      <option value="dessert">Dessert</option>
      <option value="drinks">Drinks</option>
    </select>
    <button onClick={handleUpdateItem} className="admin-update-button">
      Update Item
    </button>
  </div>
)}

    </div>
  );
};

export default AdminUpdatePage;
