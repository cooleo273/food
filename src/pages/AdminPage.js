import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs"; // Import dayjs for date comparison
import { Dropdown, DropdownButton } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "./styles.css"; // Ensure the CSS file is imported
import img1 from "../assets/7124045_logout_icon (1).png";
import img2 from "../assets/8679876_menu_add_fill_icon.png";

const AdminStatusPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [scheduledOrders, setScheduledOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCafe, setSelectedCafe] = useState("Cambridge"); // Default cafe selection
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://food-server-seven.vercel.app/api/orders")
      .then((response) => {
        const allOrders = response.data;
        setOrders(allOrders);
        filterOrders(allOrders, "Cambridge", "all"); // Initial filter for Cambridge
      })
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filterOrders = (orders, cafe, tab, status = null) => {
    const cafeOrders = orders.filter((order) => order.cafeName === cafe);

    if (tab === "paid") {
      setFilteredOrders(cafeOrders.filter((order) => order.paymentStatus === "paid"));
    } else if (tab === "delivered") {
      setFilteredOrders(cafeOrders.filter((order) => order.orderStatus === "delivered"));
    } else if (tab === "pending") {
      setFilteredOrders(cafeOrders.filter((order) => order.orderStatus === "pending"));
    } else if (tab === "scheduled") {
      const futureScheduledOrders = cafeOrders.filter(
        (order) => dayjs(order.orderDate).isAfter(dayjs()) && order.paymentStatus === "paid"
      );
      setScheduledOrders(futureScheduledOrders);
      setFilteredOrders(futureScheduledOrders);
    } else if (tab === "status" && status) {
      setFilteredOrders(cafeOrders.filter((order) => order.orderStatus === status));
    } else {
      setFilteredOrders(cafeOrders); // Default to all orders for the cafe
    }
  };

  const handleTabChange = (tab, status = null) => {
    setActiveTab(tab);
    filterOrders(orders, selectedCafe, tab, status); // Pass status when available
  };

  const handleCafeChange = (cafe) => {
    setSelectedCafe(cafe); // Update the selected cafe
    filterOrders(orders, cafe, activeTab); // Filter orders for the selected cafe and active tab
  };

  const updateStatus = (orderId, status) => {
    axios
      .put(`https://food-server-seven.vercel.app/api/orders/${orderId}/status`, { status })
      .then(() => {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, orderStatus: status } : order
          )
        );
      })
      .catch((error) => {
        console.error("Error updating status:", error.response?.data || error.message);
      });
  };

  const deleteOrder = (orderId) => {
    axios
      .delete(`https://food-server-seven.vercel.app/api/orders/${orderId}`)
      .then(() => {
        setOrders(orders.filter((order) => order._id !== orderId));
        setFilteredOrders(filteredOrders.filter((order) => order._id !== orderId));
        setScheduledOrders(scheduledOrders.filter((order) => order._id !== orderId));
      })
      .catch((error) => {
        console.error("Error deleting order:", error.response?.data || error.message);
      });
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
          <button onClick={() => navigate("/admin/menu")} className="admin-menu-button">
            <img src={img2} alt="addmenu" className="logout-icon" />
          </button>
          <button onClick={handleLogout} className="logout-button">
            <img src={img1} alt="Logout" className="logout-icon" />
            <p>Logout</p>
          </button>
        </div>
      </div>

      {/* Cafe Selection */}
      <div className="cafe-selection">
  <button 
    className={selectedCafe === "Cambridge" ? "selected" : ""} 
    onClick={() => handleCafeChange("Cambridge")}
  >
    Cambridge
  </button>
  <button 
    className={selectedCafe === "Bingham" ? "selected" : ""} 
    onClick={() => handleCafeChange("Bingham")}
  >
    Bingham
  </button>
  <button 
    className={selectedCafe === "Savor" ? "selected" : ""} 
    onClick={() => handleCafeChange("Savor")}
  >
    Savor
  </button>
</div>


      {/* Tab navigation */}
      <div className="tabs">
        <button className={activeTab === "all" ? "active" : ""} onClick={() => handleTabChange("all")}>
          All Orders
        </button>
        <button className={activeTab === "paid" ? "active" : ""} onClick={() => handleTabChange("paid")}>
          Paid Orders
        </button>
        <button className={activeTab === "delivered" ? "active" : ""} onClick={() => handleTabChange("delivered")}>
          Delivered Orders
        </button>
        <button className={activeTab === "pending" ? "active" : ""} onClick={() => handleTabChange("pending")}>
          Pending Orders
        </button>
        <button className={activeTab === "scheduled" ? "active" : ""} onClick={() => handleTabChange("scheduled")}>
          Pre-Orders
        </button>
        <DropdownButton id="dropdown-status" title="Order Status">
          <Dropdown.Item onClick={() => handleTabChange("status", "being made")}>
            Being Made
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleTabChange("status", "ready for pickup")}>
            Ready for Pickup
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleTabChange("status", "out for delivery")}>
            Out for Delivery
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleTabChange("status", "delivered")}>
            Delivered
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleTabChange("status", "cancelled")}>
            Cancelled
          </Dropdown.Item>
        </DropdownButton>
      </div>

      {/* Order Cards */}
      <div className="order-container">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <p className="order-customer">
                Customer: {order.customerName} ({order.customerPhone})
              </p>
              {order.parentsName && <p>Student: {order.parentsName}</p>}
              <p className="order-items">
                Items: {order.items?.map((item) => `${item?.name || "Unknown item"} (x${item?.quantity || 0})`).join(", ")}
              </p>
              <p className="order-cafe">Cafe: {order.cafeName}</p>
              <p className="order-status">Order Status: {order.orderStatus || "Pending"}</p>
              <p className="order-payment-status">Payment Status: {order.paymentStatus}</p>
              <p className="order-payment-status">Grade: {order.grade || "No Grade"}</p>
              <p className="order-date">Order Date: {dayjs(order.orderDate).format("YYYY-MM-DD HH:mm:ss")}</p>

              <div>
                <DropdownButton id="dropdown-basic-button" title="Actions">
                  <Dropdown.Item onClick={() => updateStatus(order._id, "being made")}>
                    Mark as Being Made
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => updateStatus(order._id, "ready for pickup")}>
                    Mark as Ready for Pickup
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => updateStatus(order._id, "out for delivery")}>
                    Mark as Out for Delivery
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => updateStatus(order._id, "delivered")}>
                    Mark as Delivered
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => updateStatus(order._id, "cancelled")}>
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
          <p>No orders found for {selectedCafe}.</p>
        )}
      </div>
    </div>
  );
};

export default AdminStatusPage;
