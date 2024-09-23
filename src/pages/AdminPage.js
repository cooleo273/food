import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Dropdown, DropdownButton } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "./styles.css"; // Ensure the CSS file is imported
import img1 from "../assets/7124045_logout_icon (1).png";
import img2 from "../assets/8679876_menu_add_fill_icon.png";

const AdminStatusPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [beingMadeOrders, setBeingMadeOrders] = useState([]);
  const [outForDeliveryOrders, setOutForDeliveryOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://food-server-seven.vercel.app/api/orders")
      .then((response) => {
        setOrders(response.data);
        setFilteredOrders(response.data);
      });
  }, []);

  const updateStatus = (orderId, status) => {
    axios
      .put(
        `https://food-server-seven.vercel.app/api/orders/${orderId}/status`,
        { status }
      )
      .then(() => {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, orderStatus: status } : order
          )
        );
      })
      .catch((error) => {
        console.error(
          "Error updating status:",
          error.response?.data || error.message
        );
      });
  };

  const deleteOrder = (orderId) => {
    axios
      .delete(`https://food-server-seven.vercel.app/api/orders/${orderId}`)
      .then(() => {
        setOrders(orders.filter((order) => order._id !== orderId));
        setFilteredOrders(
          filteredOrders.filter((order) => order._id !== orderId)
        );
      })
      .catch((error) => {
        console.error(
          "Error deleting order:",
          error.response?.data || error.message
        );
      });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "paid") {
      setFilteredOrders(
        orders.filter((order) => order.paymentStatus === "paid")
      );
    } else if (tab === "delivered") {
      setFilteredOrders(
        orders.filter((order) => order.orderStatus === "delivered")
      );
    } else if (tab === "pending") {
      setFilteredOrders(
        orders.filter((order) => order.orderStatus === "pending")
      );
    } else if (tab === "order-status") {
      setBeingMadeOrders(
        orders.filter((order) => order.orderStatus === "being made")
      );
      setOutForDeliveryOrders(
        orders.filter((order) => order.orderStatus === "out for delivery")
      );
      setDeliveredOrders(
        orders.filter((order) => order.orderStatus === "delivered")
      );
      setCancelledOrders(
        orders.filter((order) => order.orderStatus === "cancelled")
      );
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
        <h1 className="admin-header">Admin Panel - Manage Orders</h1>
        <div className="admin-actions">
          <button
            onClick={() => navigate("/admin/menu")}
            className="admin-menu-button"
          >
            <img src={img2} alt="addmenu" className="logout-icon" />
          </button>
          <button onClick={handleLogout} className="logout-button">
            <img src={img1} alt="Logout" className="logout-icon" />
            <p>Logout</p>
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => handleTabChange("all")}
        >
          All Orders
        </button>
        <button
          className={activeTab === "paid" ? "active" : ""}
          onClick={() => handleTabChange("paid")}
        >
          Paid Orders
        </button>
        <button
          className={activeTab === "delivered" ? "active" : ""}
          onClick={() => handleTabChange("delivered")}
        >
          Delivered Orders
        </button>
        <button
          className={activeTab === "pending" ? "active" : ""}
          onClick={() => handleTabChange("pending")}
        >
          Pending Orders
        </button>
        <button
          className={activeTab === "order-status" ? "active" : ""}
          onClick={() => handleTabChange("order-status")}
        >
          Order Status
        </button>
      </div>

      {activeTab === "order-status" && (
        <div>
          <h2>Being Made Orders</h2>
          {beingMadeOrders.length > 0 ? (
            beingMadeOrders.map((order) => (
              <div key={order._id} className="order-card">
                <p className="order-customer">
                  Customer: {order.customerName} ({order.customerPhone})
                </p>
                <p className="order-items">Items: {order.items.join(", ")}</p>
                <p className="order-cafe">Cafe: {order.cafeName}</p>
                <p className="order-status">Order Status: Being Made</p>
                <p className="order-payment-status">
                  Payment Status: {order.paymentStatus}
                </p>
              </div>
            ))
          ) : (
            <p className="no-orders">No orders being made.</p>
          )}

          <h2>Out for Delivery Orders</h2>
          {outForDeliveryOrders.length > 0 ? (
            outForDeliveryOrders.map((order) => (
              <div key={order._id} className="order-card">
                <p className="order-customer">
                  Customer: {order.customerName} ({order.customerPhone})
                </p>
                <p className="order-items">Items: {order.items.join(", ")}</p>
                <p className="order-cafe">Cafe: {order.cafeName}</p>
                <p className="order-status">Order Status: Out for Delivery</p>
                <p className="order-payment-status">
                  Payment Status: {order.paymentStatus}
                </p>
              </div>
            ))
          ) : (
            <p className="no-orders">No orders out for delivery.</p>
          )}

          <h2>Delivered Orders</h2>
          {deliveredOrders.length > 0 ? (
            deliveredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <p className="order-customer">
                  Customer: {order.customerName} ({order.customerPhone})
                </p>
                <p className="order-items">Items: {order.items.join(", ")}</p>
                <p className="order-cafe">Cafe: {order.cafeName}</p>
                <p className="order-status">Order Status: Delivered</p>
                <p className="order-payment-status">
                  Payment Status: {order.paymentStatus}
                </p>
              </div>
            ))
          ) : (
            <p className="no-orders">No delivered orders.</p>
          )}

          <h2>Cancelled Orders</h2>
          {cancelledOrders.length > 0 ? (
            cancelledOrders.map((order) => (
              <div key={order._id} className="order-card">
                <p className="order-customer">
                  Customer: {order.customerName} ({order.customerPhone})
                </p>
                <p className="order-items">Items: {order.items.join(", ")}</p>
                <p className="order-cafe">Cafe: {order.cafeName}</p>
                <p className="order-status">Order Status: Cancelled</p>
                <p className="order-payment-status">
                  Payment Status: {order.paymentStatus}
                </p>
              </div>
            ))
          ) : (
            <p className="no-orders">No cancelled orders.</p>
          )}
        </div>
      )}
      <div className="order-container">
        {activeTab !== "order-status" &&
          (filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <p className="order-customer">
                  Customer: {order.customerName} ({order.customerPhone})
                </p>
                <p className="order-items">Items: {order.items.join(", ")}</p>
                <p className="order-cafe">Cafe: {order.cafeName}</p>
                <p className="order-status">
                  Order Status: {order.orderStatus || "Pending"}
                </p>
                <p className="order-payment-status">
                  Payment Status: {order.paymentStatus}
                </p>

                <div className="buttons">
                  <DropdownButton id="dropdown-basic-button" title="Actions">
                    <Dropdown.Item
                      onClick={() => updateStatus(order._id, "being made")}
                    >
                      Mark as Being Made
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() =>
                        updateStatus(order._id, "ready for pickup")
                      }
                    >
                      Mark as Ready for Pickup
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() =>
                        updateStatus(order._id, "out for delivery")
                      }
                    >
                      Mark as Out for Delivery
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => updateStatus(order._id, "delivered")}
                    >
                      Mark as Delivered
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => updateStatus(order._id, "cancelled")}
                    >
                      Mark as Cancelled
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => deleteOrder(order._id)}>
                      Delete Order
                    </Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
            ))
          ) : (
            <p className="no-orders">No orders available.</p>
          ))}
      </div>
    </div>
  );
};

export default AdminStatusPage;
