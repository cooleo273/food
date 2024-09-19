import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css"; // Ensure the CSS file is imported

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/orders").then((response) => {
      setOrders(response.data);
    });
  }, []);

  const markAsDelivered = (orderId) => {
    axios
      .put(`http://localhost:5000/api/orders/${orderId}/delivered`)
      .then(() => {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, delivered: true } : order
          )
        );
      });
  };

  const handleLogout = () => {
    // Remove the admin token from local storage
    localStorage.removeItem("adminToken");
    // Redirect to the login page
    navigate("/admin-login");
  };

  return (
    <div className="admin-container">
      <div className="admin">
        <h1 className="admin-header">Admin Panel - Orders</h1>
        <div className="admin-actions">
          <button onClick={() => navigate('/admin/menu')} className="admin-menu-button">
            Add Menu
          </button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <p className="order-customer">
              Customer: {order.customerName} ({order.customerPhone})
            </p>
            <p className="order-items">Items: {order.items.join(", ")}</p>
            <p className="order-cafe">Cafe: {order.cafeName}</p>
            <p className="order-status">
              Status: {order.delivered ? "Delivered" : "Pending"}
            </p>
            <p className="order-payment-status">
              Payment Status: {order.paymentStatus}  
            </p>
            {!order.delivered && (
              <button
                className="mark-delivered-button"
                onClick={() => markAsDelivered(order._id)}
              >
                Mark as Delivered
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="no-orders">No orders available.</p>
      )}
    </div>
  );
};

export default AdminPage;
