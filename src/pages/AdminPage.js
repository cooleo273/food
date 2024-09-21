import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css"; // Ensure the CSS file is imported

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // Added state for tabs
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/orders").then((response) => {
      setOrders(response.data);
      setFilteredOrders(response.data); // Set initial filtered orders
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

  const updateStatus = (orderId, status) => {
    // Update order status on the backend (you'll need an API route for this)
    axios
      .put(`http://localhost:5000/api/orders/${orderId}/status`, { status })
      .then(() => {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status } : order
          )
        );
      });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "paid") {
      setFilteredOrders(orders.filter(order => order.paymentStatus === "paid"));
    } else if (tab === "delivered") {
      setFilteredOrders(orders.filter(order => order.delivered));
    } else if (tab === "notDelivered") {
      setFilteredOrders(orders.filter(order => !order.delivered));
    } else {
      setFilteredOrders(orders); // Show all orders
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
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

      {/* Tab navigation */}
      <div className="tabs">
        <button className={activeTab === "all" ? "active" : ""} onClick={() => handleTabChange("all")}>All Orders</button>
        <button className={activeTab === "paid" ? "active" : ""} onClick={() => handleTabChange("paid")}>Paid Orders</button>
        <button className={activeTab === "delivered" ? "active" : ""} onClick={() => handleTabChange("delivered")}>Delivered Orders</button>
        <button className={activeTab === "notDelivered" ? "active" : ""} onClick={() => handleTabChange("notDelivered")}>Not Delivered</button>
      </div>

      {filteredOrders.length > 0 ? (
        filteredOrders.map((order) => (
          <div key={order._id} className="order-card">
            <p className="order-customer">
              Customer: {order.customerName} ({order.customerPhone})
            </p>
            <p className="order-items">Items: {order.items.join(", ")}</p>
            <p className="order-cafe">Cafe: {order.cafeName}</p>
            <p className="order-status">
              Status: {order.status || "Pending"} {/* Dynamic order status */}
            </p>
            <p className="order-payment-status">
              Payment Status: {order.paymentStatus}
            </p>

            {!order.delivered && (
              <div>
                <button
                  className="mark-being-made-button"
                  onClick={() => updateStatus(order._id, "Being Made")}
                >
                  Mark as Being Made
                </button>
                <button
                  className="mark-delivered-button"
                  onClick={() => markAsDelivered(order._id)}
                >
                  Mark as Delivered
                </button>
              </div>
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
