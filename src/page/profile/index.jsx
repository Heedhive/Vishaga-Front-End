import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./style.css";
import { DOMAIN_URL } from "../../constant";

export function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [orderHistoryItems, setOrderHistoryItems] = useState([]); // New state for order history
  const [loading, setLoading] = useState(true);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false); // New loading state for order history
  const [orderHistoryError, setOrderHistoryError] = useState(null); // New error state for order history
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromURL = searchParams.get("tab") || "info";
  const [activeTab, setActiveTab] = useState(tabFromURL);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  // Fetch order history data when tab changes or userData becomes available
  useEffect(() => {
    if (activeTab === "orders" && userData) {
      fetchOrderHistoryData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                {/* <p>
                  <strong>User ID:</strong> {userData.id}
                </p> */}
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