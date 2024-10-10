  import React, { useState, useEffect } from "react";
  import { useParams } from "react-router-dom"; // Import useParams
  import axios from "axios";
  import "./styles.css";
  import TopBar from "./TopBar";
  import img from "../assets/allen-rad-OCHMcVOWRAU-unsplash.jpg";
  import CartModal from "./CartModal";
  import Navbar from "./NavBarModal/index";
  import { Snackbar, Alert, CircularProgress } from "@mui/material";

  

  const MenuPage = () => {
    const { cafeName } = useParams(); // Get cafeName from the URL params
  
    const [activeCafe, setActiveCafe] = useState(null);
    const [activeTab, setActiveTab] = useState("breakfast");
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [cart, setCart] = useState(() => {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    });
    const [notification, setNotification] = useState({
      message: "",
      severity: "info",
      open: false,
    });
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen] = useState(true);

    // Lifted paymentDetails state
    const [paymentDetails, setPaymentDetails] = useState({
      payerType: "",
      studentName: "",
      parentName: "",
      phone: "",
      date: null,
      time: null,
      deliveryType: "now",
      grade: "",
    });

    useEffect(() => {
      axios
      .get("https://food-server-seven.vercel.app/api/menu")
      .then((response) => {
        setLoading(false);
        const cafe = response.data.find((menu) => menu.cafe.toLowerCase() === cafeName.toLowerCase());
        if (cafe) {
          setActiveCafe(cafe);
        } else {
          setNotification({
            message: `Cafe ${cafeName} not found.`,
            severity: "error",
            open: true,
          });
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the menus!", error);
        
        setLoading(false);
      });
  }, [cafeName]);

    useEffect(() => {
      localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const toggleCart = () => {
      setIsCartVisible(!isCartVisible);
    };

    const handleAddToCart = (item, cafe) => {
      if (cart.length > 0 && cart[0].cafeName !== cafe) {
        setNotification({
          message: `Can't choose items from different cafes. Please stick to ${cart[0].cafeName}.`,
          severity: "error",
          open: true,
        });
        return;
      }

      const existingItemIndex = cart.findIndex(
        (cartItem) => cartItem._id === item._id && cartItem.cafeName === cafe
      );

      if (existingItemIndex === -1) {
        const newItem = {
          ...item,
          cafeName: cafe,
          quantity: 1,
          image: item.photo,
        };
        setCart((prevCart) => [...prevCart, newItem]);
        setNotification({
          message: `${item.name} added to cart!`,
          severity: "success",
          open: true,
        });
      } else {
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += 1;
        setCart(updatedCart);
        setNotification({
          message: `${item.name} quantity updated in cart!`,
          severity: "success",
          open: true,
        });
      }
    };

    const initiatePayment = async (name, phone, totalAmount, cafeName, orderDate, grade) => {
      const txRef = `CAF-${Date.now()}`;
      const title = `Order ${cart.length}`.slice(0, 16);
      const orderedItems = cart.map((item) => ({ name: item.name, quantity: item.quantity }));

      try {
        const response = await axios.post("https://food-server-seven.vercel.app/api/payment/pay", {
          amount: totalAmount,
          currency: "ETB",
          first_name: name,
          parent_name: paymentDetails.payerType === "parent" ? paymentDetails.studentName : null,
          tx_ref: txRef,
          callback_url: `https://food-server-seven.vercel.app/api/payment/verify?tx_ref=${txRef}`,
          returnUrl: "https://savoraddis.netlify.app",
          customization: {
            title: title,
            description: `Payment for ${cart.length} items`,
          },
          phoneNumber: phone,
          cafeName: cafeName,
          itemOrdered: orderedItems,
          orderDate: orderDate,
          grade: grade, // Add grade to the request payload
        });

        if (response.data && response.data.payment_url) {
          return { payment_url: response.data.payment_url, txRef };
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Payment initialization error:", error.response ? error.response.data : error.message);
        throw error;
      }
    };

    const placeOrder = async () => {
      try {
        const response = await axios.post("https://food-server-seven.vercel.app/api/orders", {
          customerName: paymentDetails.payerType === "student" ? paymentDetails.studentName : paymentDetails.parentName,
          parentsName: paymentDetails.payerType === "parent" ? paymentDetails.studentName : null,
          phoneNumber: paymentDetails.phone,
          itemsOrdered: cart.map((item) => ({ name: item.name, quantity: item.quantity })),
          cafeNames: cart.map((item) => item.cafeName),
          tx_ref: `CAF-${Date.now()}`,
          paymentStatus: "pending",
          delivered: false,
        });

        if (response.data) {
          alert(`Your order has been placed!`);
          setCart([]);
          setPaymentDetails({
            payerType: "",
            studentName: "",
            parentName: "",
            phone: "",
            date: null,
            time: null,
            deliveryType: "now",
          });
        }
      } catch (error) {
        console.error("There was an error placing the order!", error);
      }
    };

    const updateCartItemQuantity = (item, increment) => {
      setCart((prevCart) =>
        prevCart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: Math.max(cartItem.quantity + increment, 1) }
            : cartItem
        )
      );
    };

    const handleRemoveFromCart = (itemToRemove) => {
      const updatedCart = cart.filter((item) => item._id !== itemToRemove._id);
      setCart(updatedCart);
    };

    const handleCloseNotification = () => {
      setNotification((prevNotification) => ({
        ...prevNotification,
        open: false,
      }));
    };

    

    const filteredMenus = activeCafe
      ? activeCafe.items.filter((item) => item.category === activeTab)
      : [];

    return (
      <div className="menu-page-container">
       
       
        <div className={`menu-body ${isDrawerOpen ? 'with-sidebar' : 'without-sidebar'}`}>
          <TopBar toggleCart={toggleCart} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
          <div className="menu-and-cart menu-container">
            <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />
            <div className="menu-section">
              {loading ? (
                <div className="loading-container">
                  <CircularProgress />
                  <p>Loading menus, please wait...</p>
                </div>
              ) : activeCafe && filteredMenus.length > 0 ? (
                <div key={activeCafe.cafe}>
                  <ul className="menu-list">
                    {filteredMenus.map((item) => (
                      <li key={item._id} className="menu-item">
                        <img
                          src={item.photo || img}
                          alt={item.name}
                          className="menu-item-img"
                        />
                        <div className="price-and-name">
                          <h4>{item.name}</h4>
                          <p>{item.description}</p>
                          <h4 className="price">{item.price.toFixed(2)} ETB</h4>
                        </div>
                        <button
                          className="order-button"
                          onClick={() => handleAddToCart(item, activeCafe.cafe)}
                        >
                          Add to Cart
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Alert severity="error">
                  Sorry, no menu is available at the moment. Please check back later or try refreshing.
                </Alert>
              )}
            </div>

            {isCartVisible && (
              <div className="cart-section">
                <CartModal
                  isOpen={isCartVisible}
                  onClose={toggleCart}
                  cartItems={cart}
                  initiatePayment={initiatePayment}
                  onRemoveFromCart={handleRemoveFromCart}
                  updateCartItemQuantity={updateCartItemQuantity}
                  placeOrder={placeOrder}
                  payerType={paymentDetails.payerType}
                  setPayerType={(type) =>
                    setPaymentDetails((prev) => ({ ...prev, payerType: type }))
                  }
                  paymentDetails={paymentDetails}
                  setPaymentDetails={setPaymentDetails}
                />
              </div>
            )}
          </div>
        </div>

        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </div>
    );
  };

  export default MenuPage;
