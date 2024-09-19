import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css"; // Ensure the CSS file is imported
import TopBar from "./TopBar";
import img from "../assets/allen-rad-OCHMcVOWRAU-unsplash.jpg";

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null); // New state for payment status

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

  const handleOrderClick = (item, cafe) => {
    setSelectedItem(item);
    setSelectedCafe(cafe);
    setIsOrdering(true);
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();
    if (customerName && phoneNumber && selectedItem) {
      try {
        const paymentResponse = await initiatePayment(customerName, phoneNumber, selectedItem, selectedCafe);

        if (paymentResponse && paymentResponse.payment_url) {
          window.location.href = paymentResponse.payment_url;
          await placeOrder(customerName, phoneNumber, selectedItem, selectedCafe, paymentResponse.txRef);
        } else {
          alert("Failed to get payment URL");
        }
      } catch (error) {
        console.error("Payment initialization failed:", error);
        alert("Failed to initiate payment");
      }
    } else {
      alert("Please fill in all fields");
    }
  };

  const initiatePayment = async (name, phone, item, cafe) => {
    if (!item || !cafe) {
      console.error('Item or cafe is not defined');
      throw new Error('Item or cafe is not defined');
    }
  
    const txRef = `CAF-${Date.now()}`; // Generate tx_ref
    const title = `Payment for ${item.name}`.slice(0, 16); // Ensure title is within limits
    const description = `Cafe order from ${cafe}`; // Ensure description is valid
  
    try {
      const response = await axios.post("http://localhost:5000/api/payment/pay", {
        amount: item.price, // Ensure amount is a number
        currency: "ETB",
        first_name: name,
        tx_ref: txRef, // Ensure tx_ref is included
        callback_url: `http://localhost:5000/api/payment/verify?tx_ref=${txRef}`,
        customization: {
          title: title,
          description: description,
        },
        
        phoneNumber: phone, // Ensure phoneNumber is included
        cafeName: cafe, // Ensure cafeName is included
        itemOrdered: item.name // Ensure itemOrdered is included
      });
  
      // Log the entire response to see its structure
      console.log("Payment response:", response.data);
  
      // Check for the expected structure
      if (response.data && response.data.payment_url) {
        return { payment_url: response.data.payment_url, txRef };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Payment initialization error:", error.response ? error.response.data : error.message);
      throw error; // Throw error to be handled by the calling function
    }
  };

  const placeOrder = async (name, phone, item, cafe, txRef) => {
    try {
      await axios.post("http://localhost:5000/api/orders", {
        customerName: name,
        phoneNumber: phone,
        itemOrdered: item.name,
        cafeName: cafe,
        tx_ref: txRef, // Ensure this value is passed
        paymentStatus: "pending", // or other default status
        delivered: false // Default value
      });
      alert(`Order for ${item.name} from ${cafe} has been placed!`);
      setIsOrdering(false);
      setCustomerName("");
      setPhoneNumber("");
      setSelectedItem(null);
      setSelectedCafe("");
    } catch (error) {
      console.error("There was an error placing the order!", error);
    }
  };

  const closeModal = () => {
    setIsOrdering(false);
    setSelectedItem(null);
    setCustomerName("");
    setPhoneNumber("");
  };

  // Function to check payment status and update order
  const checkPaymentStatus = async (txRef) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/payment/verify`, {
        params: { tx_ref: txRef }
      });
      
      if (response.status === 200) {
        setPaymentStatus("Payment Successful");
      } else {
        setPaymentStatus("Payment Failed");
      }
    } catch (error) {
      setPaymentStatus("Error Checking Payment Status");
    }
  };

  // Handle payment status check if tx_ref is available in URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const txRef = queryParams.get('tx_ref');
    if (txRef) {
      checkPaymentStatus(txRef);
    }
  }, []);

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
                    src={`http://localhost:5000/${item.photo}` || img} // Fallback to default image if no photo
                    alt={item.name}
                    className="menu-item-img"
                  />
                  <div className="price-and-name">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p> {/* Display the description */}
                    <h4 className="price">${item.price.toFixed(2)}</h4>
                  </div>
                  <button
                    className="order-button"
                    onClick={() => handleOrderClick(item, menu.cafe)}
                  >
                    Order Now
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>Loading menus...</p>
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
            <h2>Place Your Order</h2>
            <form onSubmit={handleOrderSubmit} className="order-form">
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
              <div>
                <label>
                  Item:
                  <input
                    type="text"
                    value={selectedItem ? selectedItem.name : ""}
                    disabled
                    className="order-input"
                  />
                </label>
              </div>
              <div>
                <label>
                  Cafe:
                  <input
                    type="text"
                    value={selectedCafe}
                    disabled
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

      {/* Display payment status */}
      {paymentStatus && (
        <div className="payment-status">
          <h2>{paymentStatus}</h2>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
