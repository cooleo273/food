import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import TopBar from "./TopBar";
import img from "../assets/allen-rad-OCHMcVOWRAU-unsplash.jpg";

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cart, setCart] = useState([]); // State to hold cart items
  const [isOrdering, setIsOrdering] = useState(false);
  const [paymentStatus] = useState(null); // Payment status

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/menu")
      .then((response) => {
        setMenus(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the menus!", error);
      });
  }, []);

  // Add item to cart
  const handleAddToCart = (item, cafe) => {
    const newItem = { ...item, cafeName: cafe }; // Add cafe name to the item
    setCart([...cart, newItem]); // Add to cart
  };

  // Remove item from cart
  const handleRemoveFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1); // Remove the item from the cart
    setCart(newCart);
  };

  // Handle checkout (payment for all cart items)
  const handleCheckout = async (event) => {
    event.preventDefault();

    if (customerName && phoneNumber && cart.length > 0) {
      try {
        const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
        const paymentResponse = await initiatePayment(customerName, phoneNumber, totalPrice);

        if (paymentResponse && paymentResponse.payment_url) {
          window.location.href = paymentResponse.payment_url;
          await placeOrder(customerName, phoneNumber, cart, paymentResponse.txRef);
        } else {
          alert("Failed to get payment URL");
        }
      } catch (error) {
        console.error("Payment initialization failed:", error);
        alert("Failed to initiate payment");
      }
    } else {
      alert("Please fill in all fields and add items to the cart");
    }
  };

  // Initiate payment for the entire cart
  const initiatePayment = async (name, phone, totalAmount, item, cafe) => {
    const txRef = `CAF-${Date.now()}`; // Generate tx_ref
    const title = `Payment for Order`; // Generic title

    try {
      const response = await axios.post("http://localhost:5000/api/payment/pay", {
        amount: totalAmount, // Total price for all items
        currency: "ETB",
        first_name: name,
        tx_ref: txRef, // Unique transaction reference
        callback_url: `http://localhost:5000/api/payment/verify?tx_ref=${txRef}`,
        customization: {
          title: title,
          description: `Payment for ${cart.length} items`
        },
        phoneNumber: phone,
        cafeName: cafe, // Ensure cafeName is included
        itemOrdered: item.name 
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

  // Place order for all cart items
  const placeOrder = async (name, phone, items, txRef) => {
    try {
      await axios.post("http://localhost:5000/api/orders", {
        customerName: name,
        phoneNumber: phone,
        itemsOrdered: items.map((item) => item.name), // Array of item names
        cafeNames: items.map((item) => item.cafeName), // Array of cafe names
        tx_ref: txRef,
        paymentStatus: "pending",
        delivered: false
      });
      alert(`Your order has been placed!`);
      setIsOrdering(false);
      setCustomerName("");
      setPhoneNumber("");
      setCart([]); // Clear the cart after placing the order
    } catch (error) {
      console.error("There was an error placing the order!", error);
    }
  };

  const closeModal = () => {
    setIsOrdering(false);
    setCustomerName("");
    setPhoneNumber("");
  };

  return (
    <div className="container">
      <TopBar />

      {menus.length > 0 ? (
        menus.map((menu) => (
          <div key={menu.cafe} className="menu-section">
            <h2>{menu.cafe}</h2>
            <ul className="menu-list">
              {menu.items.map((item) => (
                <li key={item._id} className="menu-item">
                  <img
                    src={`http://localhost:5000/${item.photo}` || img}
                    alt={item.name}
                    className="menu-item-img"
                  />
                  <div className="price-and-name">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <h4 className="price">${item.price.toFixed(2)}</h4>
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
        <p>Loading menus...</p>
      )}

      {cart.length > 0 && (
        <div className="cart-section">
          <h2>Your Cart</h2>
          <ul className="cart-list">
            {cart.map((item, index) => (
              <li key={index} className="cart-item">
                <h3>{item.name} from {item.cafeName}</h3>
                <p>Price: ${item.price.toFixed(2)}</p>
                <button onClick={() => handleRemoveFromCart(index)}>Remove</button>
              </li>
            ))}
          </ul>
          <h3>Total: ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</h3>
          <button onClick={() => setIsOrdering(true)} className="checkout-button">
            Checkout
          </button>
        </div>
      )}

      {isOrdering && (
        <div
          className={`modal-overlay ${isOrdering ? "show" : ""}`}
          onClick={closeModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>
              &times;
            </button>
            <h2>Checkout</h2>
            <form onSubmit={handleCheckout} className="order-form">
              <div>
                <label>
                  Name:
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="order-input"
                  />
                </label>
              </div>
              <div>
                <label>
                  Phone Number:
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="order-input"
                  />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button type="submit" className="submit-order-button">
                  Submit Order
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentStatus && (
        <div className="payment-status">
          <h2>{paymentStatus}</h2>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
