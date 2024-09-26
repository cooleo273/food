import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import TopBar from "./TopBar";
import img from "../assets/allen-rad-OCHMcVOWRAU-unsplash.jpg";
import CartModal from "./CartModal";
import Navbar from "./NavBarModal/index";
import { Snackbar, Alert, CircularProgress } from "@mui/material"; 
import CafeSidebar from "./Sidebar"; 

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [activeCafe, setActiveCafe] = useState(null);
  const [activeTab, setActiveTab] = useState("breakfast");
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [notificationOpen, setNotificationOpen] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart"));
    if (storedCart && Array.isArray(storedCart)) {
      setCart(storedCart);
    }

    axios.get("https://food-server-seven.vercel.app/api/menu")
      .then((response) => {
        setMenus(response.data);
        setLoading(false);
        const defaultCafe = response.data.find((menu) => menu.cafe === "Cambridge");
        if (defaultCafe) {
          setActiveCafe(defaultCafe);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the menus!", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const toggleCart = () => {
    setIsCartVisible(!isCartVisible);
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
      setNotificationMessage(`${item.name} added to cart!`);
      setNotificationOpen(true);
    } else {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1; 
      setCart(updatedCart);
      setNotificationMessage(`${item.name} quantity updated in cart!`);
      setNotificationOpen(true);
    }
  };

  const initiatePayment = async (name, phone, totalAmount, cafeName, orderDate) => {
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
        orderDate: orderDate  // Format the date if needed
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
        alert(`Your order has been placed!`);
        setCart([]); 
      }
    } catch (error) {
      console.error("There was an error placing the order!", error);
    }
  };

  const updateCartItemQuantity = (item, increment) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: Math.max(cartItem.quantity + increment, 1) }
          : cartItem
      )
    );
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

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  const handleCafeSelect = (cafe) => {
    setActiveCafe(cafe); 
    setActiveTab("breakfast");
  };

  const filteredMenus = activeCafe 
    ? activeCafe.items.filter(item => item.category === activeTab)
    : [];

  return (
    <div className="menu-page-container">
      <CafeSidebar 
        cafes={menus} 
        onCafeSelect={handleCafeSelect}
        onToggleDrawer={setIsDrawerOpen} 
      />
      <div className={`menu-body ${isDrawerOpen ? 'with-sidebar' : 'without-sidebar'}`}>
        <TopBar toggleCart={toggleCart} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
        <div className="menu-and-cart menu-container">
          <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />
          <div className="menu-section">
            {loading ? (
              <div className="loading-container">
                <CircularProgress />
                <p>Loading menus, please wait...</p>
              </div>
            ) : activeCafe && filteredMenus.length > 0 ? (
              <div key={activeCafe.cafe}>
                <ul className="menu-list">
                  {filteredMenus.map((item) => (
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
                        onClick={() => handleAddToCart(item, activeCafe.cafe)}
                      >
                        Add to Cart
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Alert severity="error">Sorry, no menu is available at the moment. Please check back later or try refreshing.</Alert>
            )}
          </div>

          {isCartVisible && (
            <div className="cart-section">
              <CartModal
                isOpen={isCartVisible} // Corrected line
                onClose={toggleCart}
                cartItems={cart}
                initiatePayment={initiatePayment}
                onRemoveFromCart={handleRemoveFromCart}
                updateCartItemQuantity={updateCartItemQuantity}
                placeOrder={placeOrder}
              />
            </div>
          )}
        </div>

        <Snackbar open={notificationOpen} autoHideDuration={3000} onClose={handleCloseNotification}>
          <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
            {notificationMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default MenuPage; 
