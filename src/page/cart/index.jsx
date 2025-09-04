import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { DOMAIN_URL } from "../../constant";

export function Cart() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  const fetchCartData = async (userId, token) => {
    setCartLoading(true);
    setCartError(null);

    try {
      const ordersResponse = await fetch(`${DOMAIN_URL}cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch orders.");
      }
      const ordersData = await ordersResponse.json();

      const productsPromises = ordersData.map(async (orderItem) => {
        const productResponse = await fetch(
          `${DOMAIN_URL}products/${orderItem.product_id}`
        );
        if (!productResponse.ok) {
          console.warn(
            `Failed to fetch product details for ID: ${orderItem.productId}`
          );
          return { ...orderItem, productDetails: null };
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${DOMAIN_URL}user_profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          fetchCartData(data.id, token);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleRemoveItem = async (itemId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this item from your cart?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${DOMAIN_URL}cart/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Item removed successfully!");
        fetchCartData(userData.id, token);
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
      handleRemoveItem(itemId);
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${DOMAIN_URL}cart/${itemId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Quantity updated successfully!");
        fetchCartData(userData.id, token);
      } else {
        alert(data.error || "Failed to update quantity.");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleBuyItem = async (itemId, price, quantity) => {
    const confirmBuy = window.confirm(
      "Are you sure you want to buy this item?"
    );
    if (!confirmBuy) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${DOMAIN_URL}cart/buy_item/${itemId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: price * quantity, currency: "INR" }),
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
              const verificationResponse = await fetch(
                `${DOMAIN_URL}cart/verify_payment`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    user_id: userData.id
                  }),
                }
              );

              const verificationData = await verificationResponse.json();

              if (verificationResponse.ok) {
                alert(verificationData.message || "Payment successful!");
                fetchCartData(userData.id, token);
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

  const handlePayment = async () => {
    const token = localStorage.getItem("auth_token");
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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
              const verificationResponse = await fetch(
                `${DOMAIN_URL}cart/verify_payment`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    user_id: userData.id
                  }),
                }
              );

              const verificationData = await verificationResponse.json();

              if (verificationResponse.ok) {
                alert(verificationData.message || "Payment successful!");
                fetchCartData(userData.id, token);
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
      <div className="cart-page">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
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
              {item.productDetails &&
                item.productDetails.images &&
                item.productDetails.images.length > 0 && (
                  <img
                    src={`${DOMAIN_URL}${item.productDetails.images[0]}`}
                    alt={item.productDetails.name}
                    className="cart-item-image"
                    width={"100"}
                    height={"100"}
                  />
                )}
              <div className="cart-item-info">
                <div className="cart-item-details">
                  <h3>
                    {item.productDetails
                      ? item.productDetails.name
                      : "Product Not Found"}
                  </h3>
                  <p>
                    Price:{" "}
                    {item.productDetails
                      ? item.productDetails.prize * item.quantity
                      : "N/A"}
                  </p>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-item-quantity-controls">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value))
                      }
                      min="1"
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-action-buttons">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="remove-item-button"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() =>
                        handleBuyItem(
                          item.id,
                          item.productDetails.prize,
                          item.quantity
                        )
                      }
                      className="buy-item-button"
                    >
                      Pay with Razorpay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="cart-summary">
            <button onClick={handlePayment} className="buy-all-button">
              Pay with Razorpay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
