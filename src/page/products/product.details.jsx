import React, { useEffect, useState } from "react";
import { DOMAIN_URL } from "../../constant";
import { useParams } from "react-router-dom";
import "./productDetails.css";

export function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`${DOMAIN_URL}products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
      });
  }, [id]);

  if (!product) {
    return (
      <div className="product-details">
        <p>Loading...</p>
      </div>
    );
  }

  const handleOrder = async () => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${DOMAIN_URL}user_profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      alert("Login to add to cart");
      return;
    };
    const data = await response.json();
    const orderData = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      userId: data.id,
    };

    fetch(`${DOMAIN_URL}cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Cart request failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("cart successful:", data);
        alert("Added to cart!!");
      })
      .catch((error) => {
        console.error("Error placing order:", error);
        alert("Failed to add cart. Please try again.");
      });
  };

  return (
    <div className="product-details">
      <div className="product-main">
        <div className="product-image">
          {product.images && <img src={`${DOMAIN_URL}${product.images}`} alt={product.name} width={"40px"} />}
        </div>
        <div className="product-info">
          <h2>{product.name}</h2>
          <p>{product.line_description}</p>
          <p>prize - {product.prize}</p>
          <button onClick={handleOrder}>Add to cart</button>
        </div>
      </div>

      <div className="product-description">
        <h3>Description</h3>
        <p>{product.details}</p>
      </div>

      <div className="product-benefits-vision">
        <div className="product-benefits">
          <h3>Benefits</h3>
          <ul>
            {product.benefit && <p>{product.benefit}</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
