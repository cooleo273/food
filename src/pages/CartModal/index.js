import React, { useState } from "react";
import "./index.css";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker, TimePicker } from "@mui/x-date-pickers";

import dayjs from "dayjs";

const CartModal = ({
  isOpen,
  onClose,
  cartItems,
  initiatePayment,
  onRemoveFromCart,
  updateCartItemQuantity,
  paymentDetails,
  setPaymentDetails,
}) => {
  const [currentPage, setCurrentPage] = useState("cart"); // Track current page

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleSubmitOrder = async (event) => {
    event.preventDefault();
    const { studentName, parentName, phone, deliveryType, date, time, grade } =
      paymentDetails;

    const orderDate =
      deliveryType === "scheduled"
        ? dayjs(date)
            .hour(dayjs(time).hour())
            .minute(dayjs(time).minute())
            .toISOString()
        : new Date().toISOString();

    try {
      const paymentResponse = await initiatePayment(
        paymentDetails.payerType === "parent" ? parentName : studentName,
        phone,
        totalAmount,
        cartItems[0]?.cafeName,
        orderDate,
        grade // Include grade in payment initiation
      );

      if (paymentResponse.payment_url) {
        window.location.href = paymentResponse.payment_url;
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const renderCartItems = () => (
    <div
      className="scrollable-cart-items"
      style={{ maxHeight: "450px", overflowY: "scroll" }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        My Cart
      </Typography>
      {cartItems.length === 0 ? (
        <Typography align="center">Your cart is empty.</Typography>
      ) : (
        cartItems.map((item) => (
          <Card key={item._id} className="cart-item-card">
            <CardContent>
              <div className="cart-item-content">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography>Price: {item.price.toFixed(2)} ETB</Typography>
                  <Typography>Quantity: {item.quantity}</Typography>
                </div>
              </div>
            </CardContent>
            <CardActions>
              <IconButton
                onClick={() => updateCartItemQuantity(item, -1)}
                disabled={item.quantity <= 1}
              >
                <Remove />
              </IconButton>
              <span>{item.quantity}</span>
              <IconButton onClick={() => updateCartItemQuantity(item, 1)}>
                <Add />
              </IconButton>
              <IconButton onClick={() => onRemoveFromCart(item)} color="secondary">
                <Close />
              </IconButton>
            </CardActions>
          </Card>
        ))
      )}
      <Divider />
      <Typography variant="h6" align="right" style={{ marginTop: "16px" }}>
        Total: {totalAmount.toFixed(2)} ETB
      </Typography>
    </div>
  );

  const renderPaymentForm = () => {
    // Check if any cafe in the cart is Cambridge or Bingham
    const isCambridgeOrBingham = cartItems.some(
      (item) => item.cafeName === "Cambridge" || item.cafeName === "Bingham"
    );

    return (
      <form onSubmit={handleSubmitOrder} className="cart-items-container">
        <Typography variant="h5" align="center" gutterBottom>
          Payment Information
        </Typography>

        <TextField
          select
          label="Who is paying?"
          name="payerType"
          value={paymentDetails.payerType}
          onChange={(e) =>
            setPaymentDetails({ ...paymentDetails, payerType: e.target.value })
          }
          fullWidth
          required
          style={{ marginBottom: "16px" }} // Added margin
        >
          <MenuItem value="student">Student</MenuItem>
          <MenuItem value="parent">Parent</MenuItem>
        </TextField>

        {paymentDetails.payerType === "student" && (
          <TextField
            label="Student Name"
            variant="outlined"
            fullWidth
            value={paymentDetails.studentName}
            onChange={(e) =>
              setPaymentDetails({ ...paymentDetails, studentName: e.target.value })
            }
            required
            style={{ marginBottom: "16px" }} // Added margin
          />
        )}

        {paymentDetails.payerType === "parent" && (
          <>
            <TextField
              label="Parent Name"
              variant="outlined"
              fullWidth
              value={paymentDetails.parentName}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, parentName: e.target.value })
              }
              required
              style={{ marginBottom: "16px" }} // Added margin
            />
            <TextField
              label="Student Name"
              variant="outlined"
              fullWidth
              value={paymentDetails.studentName}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, studentName: e.target.value })
              }
              required
              style={{ marginBottom: "16px" }} // Added margin
            />
          </>
        )}

        <TextField
          label="Phone"
          variant="outlined"
          fullWidth
          value={paymentDetails.phone}
          onChange={(e) =>
            setPaymentDetails({ ...paymentDetails, phone: e.target.value })
          }
          required
          style={{ marginBottom: "16px" }} // Added margin
        />

        <TextField
          select
          label="Delivery Type"
          name="deliveryType"
          value={paymentDetails.deliveryType}
          onChange={(e) =>
            setPaymentDetails({
              ...paymentDetails,
              deliveryType: e.target.value,
            })
          }
          fullWidth
          required
          style={{ marginBottom: "16px" }} // Added margin
        >
          <MenuItem value="now">Now</MenuItem>
          <MenuItem value="scheduled">Scheduled</MenuItem>
        </TextField>

        {paymentDetails.deliveryType === "scheduled" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="Select Date"
              value={paymentDetails.date}
              onChange={(newValue) =>
                setPaymentDetails({ ...paymentDetails, date: newValue })
              }
              renderInput={(params) => (
                <TextField {...params} fullWidth required style={{ marginBottom: "16px" }} />
              )}
            />
            <TimePicker
              label="Select Time"
              value={paymentDetails.time}
              onChange={(newValue) =>
                setPaymentDetails({ ...paymentDetails, time: newValue })
              }
              renderInput={(params) => (
                <TextField {...params} fullWidth required style={{ marginBottom: "16px" }} />
              )}
            />
          </LocalizationProvider>
        )}

        {isCambridgeOrBingham && (
          <TextField
            label="Grade"
            variant="outlined"
            fullWidth
            value={paymentDetails.grade}
            onChange={(e) =>
              setPaymentDetails({ ...paymentDetails, grade: e.target.value })
            }
            required
            style={{ marginBottom: "16px" }} // Added margin
          />
        )}
      </form>
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        {currentPage === "cart" ? (
          <div>
            {renderCartItems()}
            <Divider />
          </div>
        ) : (
          <div>
            {renderPaymentForm()}
            <Divider />
          </div>
        )}
      </DialogContent>
      <DialogActions style={{ justifyContent: "space-between" }}>
        {currentPage === "cart" ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCurrentPage("payment")}
              style={{ minWidth: "100px" }} // Adjust button width here
            >
              Next
            </Button>
            <Button onClick={onClose} color="secondary">
              Close
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setCurrentPage("cart")}
              style={{ minWidth: "100px" }} // Adjust button width here
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmitOrder}
              style={{ minWidth: "100px" }} // Adjust button width here
            >
              Proceed to Payment
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CartModal;
