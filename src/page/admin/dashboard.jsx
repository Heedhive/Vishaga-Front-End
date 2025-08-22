import React, { useEffect } from "react";
import { DOMAIN_URL } from "../../constant";
import { Link } from "react-router-dom";
import "./dashboard.css"; // Import the new CSS file

export function AdminDashBoard() {
  const [products, setProducts] = React.useState([]);
  const [orders, setOrders] = React.useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${DOMAIN_URL}products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${DOMAIN_URL}orders_history`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirm) return;

    try {
      const res = await fetch(`${DOMAIN_URL}products/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      alert(result.message);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>

      <div className="section-header">
        <h2>All User Orders</h2>
      </div>
      {orders && orders.length > 0 ? (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price at Purchase</th>
              <th>Purchase Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user_id}</td>
                <td>{order.product_id}</td>
                <td>{order.product_name}</td>
                <td>{order.quantity}</td>
                <td>${order.price_at_purchase}</td>
                <td>{new Date(order.purchase_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders found.</p>
      )}

      <div className="section-header">
        <h2>Products</h2>
        <Link to={"/admin/create/product"} className="create-product-button">
          Create Product
        </Link>
      </div>
      {products && products.length > 0 ? (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Details</th>
              <th>Benefits</th>
              <th colSpan="2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.images && product.images.length > 0 ? (
                    product.images.map((img, idx) => (
                      <img
                        src={`${DOMAIN_URL}${img}`}
                        alt={product.name}
                        key={idx}
                        className="product-image"
                      />
                    ))
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td>{product.name}</td>
                <td>${product.prize}</td>
                <td>{product.details}</td>
                <td>
                  {product.benefits && product.benefits.length > 0 ? (
                    <ul className="product-benefits-list">
                      {product.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>No benefits listed</span>
                  )}
                </td>
                <td className="action-buttons">
                  <Link
                    to={`/admin/product/${product.id}/edit`}
                    className="edit-button"
                  >
                    Edit
                  </Link>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
}