import React, { useState } from "react";
import { IconButton, TextField, MenuItem } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
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
    name: "",
    phone: "",
    date: null,
    time: null,
    deliveryType: "now", // Add deliveryType state
  });
  const [step, setStep] = useState(1); // State for managing steps (1 = Cart, 2 = Payment)

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleChange = (event) => {
    setPaymentDetails({
      ...paymentDetails,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { name, phone, date, time, deliveryType } = paymentDetails;

    // If scheduled, combine date and time; otherwise, use the current date and time.
    const orderDate =
      deliveryType === "scheduled"
        ? dayjs(date)
            .hour(dayjs(time).hour())
            .minute(dayjs(time).minute())
            .toISOString()
        : new Date().toISOString(); // Use the current date and time for 'now'

    try {
      const paymentResponse = await initiatePayment(
        name,
        phone,
        totalAmount,
        cartItems[0]?.cafeName,
        orderDate // Always pass a valid date (either scheduled or current)
      );

      if (paymentResponse.payment_url) {
        // Redirect the user to the payment URL
        window.location.href = paymentResponse.payment_url;

        // Set a timer to redirect the user back to the return URL after 15 minutes (900000 ms)
        setTimeout(() => {
          window.location.href = "http://localhost:3000"; // Replace with the actual return URL
        }, 90000); // 15 minutes in milliseconds
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <>
      <div className={`overlay ${isOpen ? "active" : ""}`} onClick={onClose} />{" "}
      {/* Overlay div */}
      <div className="cart-modal">
        <div className="cart-header">
          <h2>{step === 1 ? "My Cart" : "Payment Details"}</h2>
          <button onClick={onClose}>Close</button>
        </div>

        {step === 1 && (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>{item.cafeName}</p>
                    <p>Price: {item.price.toFixed(2)} ETB</p>
                    <div className="quantity-control">
                      <div>
                        <IconButton
                          onClick={() => updateCartItemQuantity(item, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Remove />
                        </IconButton>
                        <span>{item.quantity}</span>
                        <IconButton
                          onClick={() => updateCartItemQuantity(item, 1)}
                        >
                          <Add />
                        </IconButton>
                      </div>
                      
                      <button
                        onClick={onRemoveFromCart}
                        className="remove-button"
                      >
                        <span className="icon">✖</span>
                        
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="total">Total: {totalAmount.toFixed(2)} ETB</h3>
            <div className="button-group">
              <button onClick={() => setStep(2)} className="next-button">
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
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

              {/* Delivery type dropdown */}
              <TextField
                select
                label="Delivery Type"
                name="deliveryType"
                value={paymentDetails.deliveryType}
                onChange={handleChange}
                required
              >
                <MenuItem value="now">Now</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
              </TextField>

              {/* Conditionally render date and time pickers if delivery type is "scheduled" */}
              {paymentDetails.deliveryType === "scheduled" && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    label="Select Date"
                    value={paymentDetails.date}
                    onChange={(newValue) =>
                      setPaymentDetails({ ...paymentDetails, date: newValue })
                    }
                    renderInput={(params) => <TextField {...params} required />}
                  />
                  <TimePicker
                    label="Select Time"
                    value={paymentDetails.time}
                    onChange={(newValue) =>
                      setPaymentDetails({ ...paymentDetails, time: newValue })
                    }
                    renderInput={(params) => <TextField {...params} required />}
                  />
                </LocalizationProvider>
              )}

              <div className="button-group">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="back-button"
                >
                  Back
                </button>
                <button type="submit">Proceed to Payment</button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default CartModal;
