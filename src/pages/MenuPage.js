import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import TopBar from "./TopBar";
import img from "../assets/allen-rad-OCHMcVOWRAU-unsplash.jpg";
import CartModal from "./CartModal";
import Navbar from "./NavBarModal/index";

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [activeTab, setActiveTab] = useState("breakfast");
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');

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
    const updatedCart = cart.filter((item) => item._id !== itemToRemove._id);
    setCart(updatedCart);
  };

  const initiatePayment = async (name, phone, totalAmount, cafeName, itemOrdered) => {
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
        returnUrl: "http://localhost:3000",
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

  const placeOrder = async (name, phone, items, txRef) => {
    try {
      await axios.post("https://food-server-seven.vercel.app/api/orders", {
        customerName: name,
        phoneNumber: phone,
        itemsOrdered: items.map((item) => item.name),
        cafeNames: items.map((item) => item.cafeName),
        tx_ref: txRef,
        paymentStatus: "pending",
        delivered: false,
      });

      setOrderDetails({
        customerName: name,
        phoneNumber: phone,
        itemsOrdered: items.map(item => item.name),
        cafeNames: items.map(item => item.cafeName),
        tx_ref: txRef,
      });
      setOrderStatus("Order placed successfully!");
      setCart([]); // Clear the cart after placing the order
    } catch (error) {
      console.error("There was an error placing the order!", error);
      setOrderStatus("Error placing order. Please try again.");
    }
  };

  const filteredMenus = menus
    .map((menu) => ({
      cafe: menu.cafe,
      items: menu.items.filter((item) => item.category === activeTab),
    }))
    .filter((menu) => menu.items.length > 0);

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
    } else {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    }
  };

  return (
    <div className="container">
      <TopBar toggleCart={toggleCart} cartCount={cart.length} />
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
      </div>

      {orderStatus && <h3>{orderStatus}</h3>}
      {orderDetails && (
        <div className="order-summary">
          <h4>Order Summary</h4>
          <p>Customer Name: {orderDetails.customerName}</p>
          <p>Phone Number: {orderDetails.phoneNumber}</p>
          <p>Items Ordered: {orderDetails.itemsOrdered.join(', ')}</p>
          <p>Cafes: {orderDetails.cafeNames.join(', ')}</p>
          <p>Transaction Reference: {orderDetails.tx_ref}</p>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
