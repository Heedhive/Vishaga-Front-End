import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { DOMAIN_URL } from "../../constant";

export function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState([]); // Renamed from cartData to cartItems for clarity
  const [orderHistoryItems, setOrderHistoryItems] = useState([]); // New state for order history
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [cartLoading, setCartLoading] = useState(false); // New loading state for cart
  const [cartError, setCartError] = useState(null); // New error state for cart
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false); // New loading state for order history
  const [orderHistoryError, setOrderHistoryError] = useState(null); // New error state for order history

  // Function to fetch cart data - moved outside useEffect for reusability
  const fetchCartData = async () => {
    if (!userData || !userData.id) return; // Ensure userData is available

    setCartLoading(true);
    setCartError(null);
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Fetch orders for the user
      const ordersResponse = await fetch(`${DOMAIN_URL}cart/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch orders.");
      }
      const ordersData = await ordersResponse.json();

      // Fetch details for each product in the cart
      const productsPromises = ordersData.map(async (orderItem) => {
        const productResponse = await fetch(`${DOMAIN_URL}products/${orderItem.productId}`);
        if (!productResponse.ok) {
          console.warn(`Failed to fetch product details for ID: ${orderItem.productId}`);
          return { ...orderItem, productDetails: null }; // Return item with null details
        }
        const productDetails = await productResponse.json();
        return { ...orderItem, productDetails };
      });

      const detailedCartItems = await Promise.all(productsPromises);
      setCartItems(detailedCartItems);

    } catch (err) {
      console.error("Error fetching cart data:", err);
      setCartError("Failed to load cart. Please try again.");
    } finally {
      setCartLoading(false);
    }
  };

  // Function to fetch order history data
  const fetchOrderHistoryData = async () => {
    if (!userData || !userData.id) return; // Ensure userData is available

    setOrderHistoryLoading(true);
    setOrderHistoryError(null);
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const ordersHistoryResponse = await fetch(`${DOMAIN_URL}orders_history/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!ordersHistoryResponse.ok) {
        throw new Error("Failed to fetch order history.");
      }
      const historyData = await ordersHistoryResponse.json();

      const productsPromises = historyData.map(async (orderItem) => {
        const productResponse = await fetch(`${DOMAIN_URL}products/${orderItem.product_id}`);
        if (!productResponse.ok) {
          console.warn(`Failed to fetch product details for ID: ${orderItem.product_id}`);
          return { ...orderItem, productDetails: null };
        }
        const productDetails = await productResponse.json();
        return { ...orderItem, productDetails };
      });

      const detailedOrderHistoryItems = await Promise.all(productsPromises);
      setOrderHistoryItems(detailedOrderHistoryItems);

    } catch (err) {
      console.error("Error fetching order history:", err);
      setOrderHistoryError("Failed to load order history. Please try again.");
    } finally {
      setOrderHistoryLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${DOMAIN_URL}user_profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setEditUsername(data.username);
          setEditEmail(data.email);
        } else {
          // If not logged in or token invalid, navigate to login
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/login"); // Navigate to login on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Fetch cart data when tab changes or userData becomes available
  useEffect(() => {
    if (activeTab === "cart" && userData) {
      fetchCartData();
    }
  }, [activeTab, userData, navigate]);

  // Fetch order history data when tab changes or userData becomes available
  useEffect(() => {
    if (activeTab === "orders" && userData) {
      fetchOrderHistoryData();
    }
  }, [activeTab, userData, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateMessage('');
    setUpdateError('');

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUpdateError("Authentication token missing. Please log in again.");
      navigate("/login");
      return;
    }

    const updateData = {
      username: editUsername,
      email: editEmail,
    };

    if (editPassword) {
      updateData.password = editPassword;
    }

    try {
      const response = await fetch(`${DOMAIN_URL}user_profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateMessage(data.message || "Profile updated successfully!");
        // Optionally re-fetch user data to update displayed info
        // fetchUserProfile(); // This would re-run the useEffect
      } else {
        setUpdateError(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError("Network error. Please try again.");
    }
  };

  const handleRemoveItem = async (itemId) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this item from your cart?");
    if (!confirmDelete) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${DOMAIN_URL}cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Item removed successfully!");
        fetchCartData(); // Re-fetch cart data to update UI
      } else {
        alert(data.error || "Failed to remove item.");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId); // Remove if quantity goes to 0 or less
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${DOMAIN_URL}cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Quantity updated successfully!");
        fetchCartData(); // Re-fetch cart data to update UI
      } else {
        alert(data.error || "Failed to update quantity.");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleBuyItem = async (itemId, price, quantity) => {
    const confirmBuy = window.confirm("Are you sure you want to buy this item?");
    if (!confirmBuy) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${DOMAIN_URL}cart/buy_item/${itemId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: price * quantity, currency: 'INR' }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const options = {
          key: data.razorpay_key,
          amount: data.amount,
          currency: data.currency,
          name: "Rice",
          description: "Payment for your order",
          order_id: data.order_id,
          handler: async function (response) {
            try {
              const verificationResponse = await fetch(
                `${DOMAIN_URL}cart/verify_payment`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                }
              );

              const verificationData = await verificationResponse.json();

              if (verificationResponse.ok) {
                alert(verificationData.message || "Payment successful!");
                fetchCartData(); // Re-fetch cart data to update UI
              } else {
                alert(
                  verificationData.error || "Payment verification failed."
                );
              }
            } catch (error) {
              console.error("Error verifying payment:", error);
              alert("Network error. Please try again.");
            }
          },
          prefill: {
            name: userData.username,
            email: userData.email,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert(data.error || "Failed to create Razorpay order.");
      }
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      alert("Network error. Please try again.");
    }
  };

  const handlePayment = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      navigate("/login");
      return;
    }

    if (!userData || !userData.id) {
      alert("User data not available. Cannot proceed with purchase.");
      return;
    }

    try {
      const response = await fetch(`${DOMAIN_URL}cart/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userData.id }),
      });

      const data = await response.json();

      if (response.ok) {
        const options = {
          key: data.razorpay_key,
          amount: data.amount,
          currency: data.currency,
          name: "Rice",
          description: "Payment for your order",
          order_id: data.order_id,
          handler: async function (response) {
            try {
              const verificationResponse = await fetch(`${DOMAIN_URL}cart/verify_payment`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                }
              );

              const verificationData = await verificationResponse.json();

              if (verificationResponse.ok) {
                alert(verificationData.message || "Payment successful!");
                fetchCartData(); // Re-fetch cart data to update UI
              } else {
                alert(verificationData.error || "Payment verification failed.");
              }
            } catch (error) {
              console.error("Error verifying payment:", error);
              alert("Network error. Please try again.");
            }
          },
          prefill: {
            name: userData.username,
            email: userData.email,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert(data.error || "Failed to create Razorpay order.");
      }
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <h2>My Profile</h2>
        <ul>
          <li
            onClick={() => setActiveTab("info")}
            className={activeTab === "info" ? "active" : ""}
          >
            Profile Info
          </li>
          <li
            onClick={() => setActiveTab("edit")}
            className={activeTab === "edit" ? "active" : ""}
          >
            Edit Profile
          </li>
          <li
            onClick={() => setActiveTab("cart")}
            className={activeTab === "cart" ? "active" : ""}
          >
            Cart
          </li>
          <li
            onClick={() => setActiveTab("orders")}
            className={activeTab === "orders" ? "active" : ""}
          >
            Order History
          </li>
        </ul>
      </aside>

      <section className="profile-content">
        {activeTab === "info" && (
          <div>
            <h3>User Information</h3>
            {userData ? (
              <>
                <p>
                  <strong>Username:</strong> {userData.username}
                </p>
                <p>
                  <strong>Email:</strong> {userData.email}
                </p>
                <p>
                  <strong>User ID:</strong> {userData.id}
                </p>
              </>
            ) : (
              <p>No user data available. Please log in.</p>
            )}
          </div>
        )}

        {activeTab === "edit" && (
          <div>
            <h3>Edit Profile</h3>
            {updateMessage && <p className="success-message">{updateMessage}</p>}
            {updateError && <p className="error-message">{updateError}</p>}
            <form className="edit-form" onSubmit={handleProfileUpdate}>
              <input
                type="text"
                placeholder="Username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password (leave blank to keep current)"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
              <button type="submit">Update</button>
            </form>
          </div>
        )}

        {activeTab === "cart" && (
          <div>
            <h3>Your Cart</h3>
            {cartLoading ? (
              <p>Loading cart...</p>
            ) : cartError ? (
              <p className="error-message">{cartError}</p>
            ) : cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    {item.productDetails && item.productDetails.images && item.productDetails.images.length > 0 && (
                      <img
                        src={`${DOMAIN_URL}${item.productDetails.images[0]}`}
                        alt={item.productDetails.name}
                        className="cart-item-image"
                        width={"100"}
                        height={"100"}
                      />
                    )}
                    <div className="cart-item-details">
                      <h3>{item.productDetails ? item.productDetails.name : 'Product Not Found'}</h3>
                      <p>Price: ${item.productDetails ? item.productDetails.prize : 'N/A'}</p>
                      <div className="cart-item-quantity-controls">
                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                          min="1"
                        />
                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="remove-item-button"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => handleBuyItem(item.id, item.productDetails.prize, item.quantity)}
                        className="buy-item-button"
                      >
                        Pay with Razorpay
                      </button>
                    </div>
                  </div>
                ))}
                <div className="cart-summary">
                  <button onClick={handlePayment} className="buy-all-button">Pay with Razorpay</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h3>Your Order History</h3>
            {orderHistoryLoading ? (
              <p>Loading order history...</p>
            ) : orderHistoryError ? (
              <p className="error-message">{orderHistoryError}</p>
            ) : orderHistoryItems.length === 0 ? (
              <p>You have no past orders.</p>
            ) : (
              <div className="order-items-list">
                {orderHistoryItems.map((item) => (
                  <div key={item.id} className="order-item-card">
                    {item.productDetails && item.productDetails.images && item.productDetails.images.length > 0 && (
                      <img
                        src={`${DOMAIN_URL}${item.productDetails.images[0]}`}
                        alt={item.productDetails.name}
                        className="order-item-image"
                        width={"100"}
                        height={"100"}
                      />
                    )}
                    <div className="order-item-details">
                      <h3>{item.productDetails ? item.productDetails.name : 'Product Not Found'}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price at Purchase: ${item.price_at_purchase}</p>
                      <p>Purchase Date: {new Date(item.purchase_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}