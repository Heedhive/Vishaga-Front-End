import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { DOMAIN_URL } from "../../constant";
import { useUser } from "../../utils";

export function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState(null);
  const { userInfo } = useUser();

  const fetchCartData = () => {
    setLoading(true);
    setCartError(null);
    try {
      const localCart = localStorage.getItem("cart");
      const cart = localCart ? JSON.parse(localCart) : [];
      setCartItems(cart);
    } catch (err) {
      console.error("Error fetching cart data from local storage:", err);
      setCartError("Failed to load cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleRemoveItem = (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this item from your cart?"
    );
    if (!confirmDelete) return;

    const updatedCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleBuyItem = async (itemId, price, quantity) => {
    const confirmBuy = window.confirm(
      "Are you sure you want to buy this item?"
    );
    if (!confirmBuy) return;

    const token = localStorage.getItem("auth_token");
    if (!token || !userInfo) {
      alert("Authentication token missing. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${DOMAIN_URL}cart/buy_item`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: price * quantity, currency: "INR", product_id: itemId, quantity }),
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
                    user_id: userInfo.id,
                    phone_number: userInfo.phone_number,
                    address: userInfo.address,
                  }),
                }
              );

              const verificationData = await verificationResponse.json();

              if (verificationResponse.ok) {
                alert(verificationData.message || "Payment successful!");
                const updatedCart = cartItems.filter((item) => item.id !== itemId);
                setCartItems(updatedCart);
                localStorage.setItem("cart", JSON.stringify(updatedCart));
              } else {
                alert(verificationData.error || "Payment verification failed.");
              }
            } catch (error) {
              console.error("Error verifying payment:", error);
              alert("Network error. Please try again.");
            }
          },
          prefill: {
            name: userInfo.username,
            email: userInfo.email,
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
      {cartError ? (
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
        </div>
      )}
    </div>
  );
}