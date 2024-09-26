import React, { useState } from "react";
import { IconButton, TextField, MenuItem } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';  // Import dayjs
import 'moment/locale/de';
import "./index.css";

const CartModal = ({
  isOpen,
  onClose,
  cartItems,
  initiatePayment,
  placeOrder,
  onRemoveFromCart,
  updateCartItemQuantity,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("now");
  const [deliveryDate, setDeliveryDate] = useState(dayjs());  // Use dayjs for date
  const [deliveryTime, setDeliveryTime] = useState(dayjs());  // Use dayjs for time

  if (!isOpen) return null;

  const handleCheckout = async (event) => {
    event.preventDefault();

    if (customerName && phoneNumber && cartItems.length > 0) {
      try {
        const totalPrice = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const cafeName = cartItems[0].cafeName;
        const itemOrdered = cartItems.map((item) => item.name).join(", ");

        // Combine the selected date and time using dayjs
        const selectedDeliveryTime =
          deliveryOption === "now" ? dayjs() : dayjs(deliveryDate).hour(deliveryTime.hour()).minute(deliveryTime.minute());

        const paymentResponse = await initiatePayment(
          customerName,
          phoneNumber,
          totalPrice,
          cafeName,
          itemOrdered,
          selectedDeliveryTime.toDate()  // Convert dayjs to JS Date object for the backend
        );

        if (paymentResponse && paymentResponse.payment_url) {
          const paymentWindow = window.open(
            paymentResponse.payment_url,
            "_blank"
          );
          setTimeout(() => {
            if (paymentWindow) {
              paymentWindow.close();
            }
            window.location.href = "http://savoraddis.netlify.app";
          }, 100000);

          await placeOrder(
            customerName,
            phoneNumber,
            cartItems,
            paymentResponse.txRef,
            selectedDeliveryTime.toDate()  // Convert dayjs to JS Date object for the backend
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
                    <span>{item.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} ETB</span>
                  </div>
                  <div className="quantity-control">
                    <IconButton
                      aria-label="decrease quantity"
                      onClick={() => handleQuantityChange(item, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Remove />
                    </IconButton>{" "}
                    {item.quantity}{" "}
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

            {/* Delivery Option Selection */}
            <div className="form-group">
              <label htmlFor="deliveryOption">Delivery Time</label>
              <TextField
                select
                label="Select Delivery Time"
                value={deliveryOption}
                onChange={(e) => setDeliveryOption(e.target.value)}
                fullWidth
              >
                <MenuItem value="now">Deliver Now</MenuItem>
                <MenuItem value="schedule">Schedule for Later</MenuItem>
              </TextField>
            </div>

            {/* Date Picker and Time Picker for Scheduled Delivery */}
            {deliveryOption === "schedule" && (
              <div className="form-group">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    label="Select date"
                    value={deliveryDate}
                    onChange={(newDate) => setDeliveryDate(newDate)}  // Use dayjs object
                    renderInput={(params) => <TextField {...params} />}
                  />
                  <TimePicker
                    label="Select time"
                    value={deliveryTime}
                    onChange={(newTime) => setDeliveryTime(newTime)}  // Use dayjs object
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
            )}

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
