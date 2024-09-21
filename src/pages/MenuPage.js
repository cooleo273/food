// MenuPage.js
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
  const [activeTab, setActiveTab] = useState("breakfast"); // Active tab state
  const [isCartVisible, setIsCartVisible] = useState(false);

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

  const toggleCart = () => {
    setIsCartVisible(!isCartVisible);
  };

  // Remove item from cart by its unique ID and cafe name
  const handleRemoveFromCart = (itemToRemove) => {
    const newCart = cart.filter(
      (item) =>
        item._id !== itemToRemove._id || item.cafeName !== itemToRemove.cafeName
    );
    setCart(newCart); // Update the cart with the item removed
  };

  // Handle checkout (payment for all cart items)
  const handleCheckout = async (event) => {
    event.preventDefault();

    if (customerName && phoneNumber && cart.length > 0) {
      try {
        const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
        const cafeName = cart[0].cafeName;
        const itemOrdered = cart.map((item) => item.name).join(", ");

        const paymentResponse = await initiatePayment(
          customerName,
          phoneNumber,
          totalPrice,
          cafeName,
          itemOrdered
        );

        if (paymentResponse && paymentResponse.payment_url) {
          // Open payment URL in a new tab
          const paymentWindow = window.open(
            paymentResponse.payment_url,
            "_blank"
          );

          // Delay redirect to return URL after payment
          setTimeout(() => {
            if (paymentWindow) {
              paymentWindow.close(); // Close the payment window after delay
            }
            window.location.href = "http://localhost:3000"; // Redirect to your app
          }, 10000); // Delay in milliseconds (e.g., 10000 for 10 seconds)

          // Place order for the items
          await placeOrder(
            customerName,
            phoneNumber,
            cart,
            paymentResponse.txRef
          );
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
  const initiatePayment = async (
    name,
    phone,
    totalAmount,
    cafeName,
    itemOrdered
  ) => {
    const txRef = `CAF-${Date.now()}`; // Generate unique tx_ref
    const title = `Order ${cart.length}`.slice(0, 16); // Ensure title doesn't exceed 16 characters
    const orderedItems = cart.map((item) => item.name).join(", ");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/payment/pay",
        {
          amount: totalAmount,
          currency: "ETB",
          first_name: name,
          tx_ref: txRef,
          callback_url: `http://localhost:5000/api/payment/verify?tx_ref=${txRef}`,
          returnUrl: "http://localhost:3000",
          customization: {
            title: title,
            description: `Payment for ${cart.length} items`,
          },
          phoneNumber: phone,
          cafeName: cafeName,
          itemOrdered: orderedItems,
        }
      );

      if (response.data && response.data.payment_url) {
        return { payment_url: response.data.payment_url, txRef };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(
        "Payment initialization error:",
        error.response ? error.response.data : error.message
      );
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
        delivered: false,
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

  const filteredMenus = menus
    .map((menu) => ({
      cafe: menu.cafe,
      items: menu.items.filter((item) => item.category === activeTab),
    }))
    .filter((menu) => menu.items.length > 0);

  // Add item to cart
  const handleAddToCart = (item, cafe) => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem._id === item._id && cartItem.cafeName === cafe
    );

    if (existingItemIndex === -1) {
      const newItem = { ...item, cafeName: cafe, quantity: 1 }; // Initialize quantity to 1
      setCart((prevCart) => [...prevCart, newItem]);
    } else {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1; // Increase quantity by 1
      setCart(updatedCart);
    }
  };

  // Other methods remain the same...

  return (
    <div className="container">
      <TopBar toggleCart={toggleCart} cartCount={cart.length} />
      {/* Tabs for categories */}
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

      {/* Menu Items based on selected tab */}
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
                        src={`http://localhost:5000/${item.photo}` || img}
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
            <p>No items available for {activeTab}.</p>
          )}
        </div>

        {/* Cart Section */}
        {isCartVisible && (
          <div className="cart-section">
            
            <ul className="cart-list">
              {cart.map((item, index) => (
                <li key={index} className="cart-item">
                  <h3>
                    {item.name} ({item.quantity})
                  </h3>
                  <p>{(item.price * item.quantity).toFixed(2)}ETB</p>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveFromCart(item)}
                  >
                    &times;{" "}
                    {/* This represents the multiplication sign, often used as an "X" */}
                  </button>
                </li>
              ))}
            </ul>
            <h3>
              Total:
              {cart
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toFixed(2)}{" "}
              ETB
            </h3>
            <button
              onClick={() => setIsOrdering(true)}
              className="checkout-button"
            >
              Checkout
            </button>
          </div>
        )}
      </div>

      {isOrdering && (
        <div
          className={`modal-overlay ${isOrdering ? "show" : ""}`}
          onClick={closeModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>
              &times;
            </button>
            <h2>Enter Your Information</h2>
            <form onSubmit={handleCheckout}>
              <input
                type="text"
                placeholder="Your Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <button type="submit" className="submit-button">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
