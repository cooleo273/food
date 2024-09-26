import React, { useState } from "react";
import { IconButton, TextField } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';    
import "./index.css";

const CartModal = ({
  isOpen,
  onClose,
  cartItems,
  initiatePayment,
  onRemoveFromCart,
  updateCartItemQuantity,
}) => {
  const [paymentDetails, setPaymentDetails] = useState({ 
    name: '', 
    phone: '', 
    date: null, 
    time: null 
  });
  
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleChange = (event) => {
    setPaymentDetails({ ...paymentDetails, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { name, phone, date, time } = paymentDetails;

    // Combine date and time to create orderDate
    const orderDate = dayjs(date).hour(dayjs(time).hour()).minute(dayjs(time).minute()).toISOString();

    try {
      const paymentResponse = await initiatePayment(name, phone, totalAmount, cartItems[0]?.cafeName, orderDate);
      if (paymentResponse.payment_url) {
        window.location.href = paymentResponse.payment_url;
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <>
      <div className={`overlay ${isOpen ? 'active' : ''}`} onClick={onClose} /> {/* Overlay div */}
      <div className="cart-modal">
        <div className="cart-header">
          <h2>My Cart</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-img" />
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <p>{item.cafeName}</p>
                <p>Price: {item.price.toFixed(2)} ETB</p>
                <div className="quantity-control">
                  <IconButton onClick={() => updateCartItemQuantity(item, -1)} disabled={item.quantity <= 1}>
                    <Remove />
                  </IconButton>
                  <span>{item.quantity}</span>
                  <IconButton onClick={() => updateCartItemQuantity(item, 1)}>
                    <Add />
                  </IconButton>
                  <button onClick={() => onRemoveFromCart(item)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <h3 className="total">Total: {totalAmount.toFixed(2)} ETB</h3>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={paymentDetails.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Phone"
            name="phone"
            value={paymentDetails.phone}
            onChange={handleChange}
            required
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="Select Date"
              value={paymentDetails.date}
              onChange={(newValue) => setPaymentDetails({ ...paymentDetails, date: newValue })}
              renderInput={(params) => <TextField {...params} />}
            />
            <TimePicker
              label="Select Time"
              value={paymentDetails.time}
              onChange={(newValue) => setPaymentDetails({ ...paymentDetails, time: newValue })}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <button type="submit">Proceed to Payment</button>
        </form>
      </div>
    </>
  );
};

export default CartModal;
