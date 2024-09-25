import React from "react";
import { IconButton } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import "./index.css"; // Import your CSS file for styling

const CartModal = ({
  isOpen,
  onClose,
  cartItems,
  initiatePayment,
  placeOrder,
  onRemoveFromCart,
  updateCartItemQuantity,
}) => {
  const [customerName, setCustomerName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");

  if (!isOpen) return null;

  const handleCheckout = async (event) => {
    event.preventDefault();

    if (customerName && phoneNumber && cartItems.length > 0) {
      try {
        const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const cafeName = cartItems[0].cafeName;
        const itemOrdered = cartItems.map((item) => item.name).join(", ");

        const paymentResponse = await initiatePayment(
          customerName,
          phoneNumber,
          totalPrice,
          cafeName,
          itemOrdered
        );

        if (paymentResponse && paymentResponse.payment_url) {
          const paymentWindow = window.open(
            paymentResponse.payment_url,
            "_blank"
          );
          setTimeout(() => {
            if (paymentWindow) {
              paymentWindow.close(); // Close the payment window after delay
            }
            window.location.href = "http://savoraddis.netlify.app"; // Redirect to your app
          }, 100000);

          await placeOrder(
            customerName,
            phoneNumber,
            cartItems,
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

  const handleQuantityChange = (item, increment) => {
    updateCartItemQuantity(item, increment);
  };

  return (
    <div className="cart-modal-overlay">
      <div className="cart-modal">
        <div className="cart-modal-header">
          <h2>Your Cart</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="cart-modal-body">
          {cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <ul className="cart-item-list">
              {cartItems.map((item, index) => (
                <li key={index} className="cart-item">
                  <div className="image-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-img"
                    />
                    
                    <span>
                        
                        {item.name}
                      </span>
                    <span>{(item.price * item.quantity).toFixed(2)} ETB</span>
                  </div>
                  <div className="quantity-control">
                  <IconButton
                        aria-label="decrease quantity"
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                     {" "} {item.quantity}{" "}
                      <IconButton
                        aria-label="increase quantity"
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        <Add />
                      </IconButton>
                      
                      
                    </div>
                  <button
                    className="remove-button"
                    onClick={() => onRemoveFromCart(item)}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="cart-modal-footer">
          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <button type="submit" className="checkout-button">
              Proceed to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
