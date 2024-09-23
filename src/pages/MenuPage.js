import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import TopBar from "./TopBar";
import img from "../assets/allen-rad-OCHMcVOWRAU-unsplash.jpg";
import CartModal from "./CartModal";
import Navbar from "./NavBarModal/index";
import { Snackbar, Alert } from "@mui/material"; // Import Snackbar and Alert

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [activeTab, setActiveTab] = useState("breakfast");
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [orderDetails, setOrderDetails] = useState(null); 
  const [notificationOpen, setNotificationOpen] = useState(false); // State for notification
  const [notificationMessage, setNotificationMessage] = useState(""); // State for notification message

  const calculateTotalCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleAddToCart = (item, cafe) => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem._id === item._id && cartItem.cafeName === cafe
    );
  
    if (existingItemIndex === -1) {
      const newItem = { 
        ...item, 
        cafeName: cafe, 
        quantity: 1, 
        image: item.photo
      };
      setCart((prevCart) => [...prevCart, newItem]);
      setNotificationMessage(`${item.name} added to cart!`); // Set notification message
      setNotificationOpen(true); // Open notification
    } else {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1; 
      setCart(updatedCart);
      
      // Show notification for quantity increase
      setNotificationMessage(`${item.name} added in cart!`);
      setNotificationOpen(true);
    }
  };
  

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart"));
    if (storedCart && Array.isArray(storedCart)) {
      setCart(storedCart);
    }

    axios
      .get("https://food-server-seven.vercel.app/api/menu")
      .then((response) => {
        setMenus(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the menus!", error);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const toggleCart = () => {
    setIsCartVisible(!isCartVisible);
  };

  const handleRemoveFromCart = (itemToRemove) => {
    const updatedCart = cart.map((item) => {
      if (item._id === itemToRemove._id) {
        if (item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 }; 
        }
        return null; 
      }
      return item;
    }).filter((item) => item !== null); 
  
    setCart(updatedCart);
  };

  const initiatePayment = async (name, phone, totalAmount, cafeName) => {
    const txRef = `CAF-${Date.now()}`;
    const title = `Order ${cart.length}`.slice(0, 16);
    const orderedItems = cart.map((item) => item.name).join(", ");

    try {
      const response = await axios.post("https://food-server-seven.vercel.app/api/payment/pay", {
        amount: totalAmount,
        currency: "ETB",
        first_name: name,
        tx_ref: txRef,
        callback_url: `https://food-server-seven.vercel.app/api/payment/verify?tx_ref=${txRef}`,
        returnUrl: "https://savoraddis.netlify.app",
        customization: {
          title: title,
          description: `Payment for ${cart.length} items`,
        },
        phoneNumber: phone,
        cafeName: cafeName,
        itemOrdered: orderedItems,
      });
      
      if (response.data && response.data.payment_url) {
        return { payment_url: response.data.payment_url, txRef };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Payment initialization error:", error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const placeOrder = async (name, phone) => {
    try {
      const response = await axios.post("https://food-server-seven.vercel.app/api/orders", {
        customerName: name,
        phoneNumber: phone,
        itemsOrdered: cart.map((item) => item.name),
        cafeNames: cart.map((item) => item.cafeName),
        tx_ref: `CAF-${Date.now()}`,
        paymentStatus: "pending",
        delivered: false,
      });

      if (response.data) {
        setOrderDetails(response.data.order); 
        alert(`Your order has been placed!`);
        setCart([]); 
      }
    } catch (error) {
      console.error("There was an error placing the order!", error);
    }
  };

  const filteredMenus = menus
    .map((menu) => ({
      cafe: menu.cafe,
      items: menu.items.filter((item) => item.category === activeTab),
    }))
    .filter((menu) => menu.items.length > 0);

  // Notification close handler
  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  return (
    <div className="container">
      <TopBar toggleCart={toggleCart} cartCount={calculateTotalCount()} />
      <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />

      <div className="menu-and-cart">
        <div className="menu-section">
          {filteredMenus.length > 0 ? (
            filteredMenus.map((menu) => (
              <div key={menu.cafe}>
                <h2>{menu.cafe}</h2>
                <ul className="menu-list">
                  {menu.items.map((item) => (
                    <li key={item._id} className="menu-item">
                      <img
                        src={item.photo || img}
                        alt={item.name}
                        className="menu-item-img"
                      />
                      <div className="price-and-name">
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <h4 className="price">{item.price.toFixed(2)} ETB</h4>
                      </div>
                      <button
                        className="order-button"
                        onClick={() => handleAddToCart(item, menu.cafe)}
                      >
                        Add to Cart
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No menu items available</p>
          )}
        </div>

        {isCartVisible && (
          <div className="cart-section">
            <CartModal
              isOpen={isCartVisible}
              onClose={toggleCart}
              cartItems={cart}
              initiatePayment={initiatePayment}
              placeOrder={placeOrder}
              onRemoveFromCart={handleRemoveFromCart}
            />
          </div>
        )}

        {orderDetails && (
          <div className="order-confirmation">
            <h3>Order Confirmation</h3>
            <p>Order ID: {orderDetails._id}</p>
            <p>Items Ordered:</p>
            <ul>
              {orderDetails.itemsOrdered.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p>Status: {orderDetails.orderStatus}</p>
          </div>
        )}
      </div>

      {/* Notification Snackbar */}
      <Snackbar open={notificationOpen} autoHideDuration={3000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MenuPage;
