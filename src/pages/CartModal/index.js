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
  Snackbar,
  Alert,
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
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "error",
  });

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
        cartItems.some(item => item.cafeName === "Savor") ? studentName : (paymentDetails.payerType === "parent" ? parentName : studentName),
        phone,
        totalAmount,
        cartItems[0]?.cafeName,
        orderDate,
        grade // Include grade in payment initiation
      );
  
      if (paymentResponse.payment_url) {
        // Open the payment URL in a new tab
        window.open(paymentResponse.payment_url, "_blank");
  
        // Redirect to the main page after a timeout
        setTimeout(() => {
          window.location.href = "https://savoraddis.netlify.app/";
        }, 2000); // 2000 ms delay before redirecting
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };
  
  

  const handleNextPage = () => {
    if (cartItems.length === 0) {
      setNotification({
        open: true,
        message: "Your cart is empty. Please add items before proceeding.",
        severity: "error",
      });
    } else {
      setCurrentPage("payment");
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const renderCartItems = () => (
    <div
      className="scrollable-cart-items"
      style={{ maxHeight: "500px", overflowY: "scroll" }}
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
              <IconButton onClick={() => onRemoveFromCart(item)} color="#ff0000">
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
    const isCambridgeOrBingham = cartItems.some(
      (item) => item.cafeName === "Cambridge" || item.cafeName === "Bingham"
    );

    const isFromSavor = cartItems.some((item) => item.cafeName === "Savor");

    return (
      <form onSubmit={handleSubmitOrder} className="cart-items-container">
        <Typography variant="h5" align="center" gutterBottom>
          Payment Information
        </Typography>

        {/* Payer type selection only if not from Savor */}
        {!isFromSavor && (
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
            style={{ marginBottom: "16px" }}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="parent">Parent</MenuItem>
          </TextField>
        )}

        {/* If it's from Savor, only require customer name */}
        {isFromSavor ? (
          <TextField
            label="Customer Name"
            variant="outlined"
            fullWidth
            value={paymentDetails.studentName}
            onChange={(e) =>
              setPaymentDetails({ ...paymentDetails, studentName: e.target.value })
            }
            required
            style={{ marginBottom: "16px" }}
          />
        ) : (
          <>
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
                style={{ marginBottom: "16px" }}
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
                  style={{ marginBottom: "16px" }}
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
                  style={{ marginBottom: "16px" }}
                />
              </>
            )}
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
          style={{ marginBottom: "16px" }}
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
          style={{ marginBottom: "16px" }}
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
            style={{ marginBottom: "16px" }}
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
            
            <Button onClick={onClose} style={{  background: "rgb(255, 96, 92)" , color: "#ffffff" }}>
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleNextPage}
              style={{ minWidth: "100px", background: "#FE8C00" }}
            >
              Next
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              onClick={() => setCurrentPage("cart")}
              style={{ minWidth: "100px", background: "#FE8C00" }}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmitOrder}
              style={{ minWidth: "100px", background: "#4CAF50" }}
            >
              Proceed to Payment
            </Button>
          </>
        )}
      </DialogActions>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CartModal;
