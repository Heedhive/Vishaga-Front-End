import React, { useEffect, useState } from "react";
import { DOMAIN_URL } from "../../constant";
import { Link, useParams } from "react-router-dom";
import "./productDetails.css";

export function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [cart, setCart] = useState(null);

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

  useEffect(() => {
    const readCart = () => {
      const localCart = localStorage.getItem("cart");
      if (localCart && product) {
        const cartData = JSON.parse(localCart);
        if (cartData && cartData.length > 0) {
          const productInCart = cartData.find((item) => item.id === product.id);
          if (productInCart) {
            setCart(productInCart);
          } else {
            setCart(null);
          }
        } else {
          setCart(null);
        }
      }
    };
    readCart();
  }, [product]);

  useEffect(() => {
    if (product && product.benefit) {
      const benefits = product.benefit.split(",");
      if (benefits.length > 0) {
        setBenefits(benefits);
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="product-details">
        <p>Loading...</p>
      </div>
    );
  }

  const handleOrder = () => {
    const localCart = localStorage.getItem("cart");
    const cartData = localCart ? JSON.parse(localCart) : [];
    const productInCart = cartData.find((item) => item.id === product.id);

    if (productInCart) {
      alert("Product is already in the cart.");
      return;
    }

    const orderData = {
      id: product.id,
      name: product.name,
      quantity: 1,
      productDetails: product,
    };

    cartData.push(orderData);
    localStorage.setItem("cart", JSON.stringify(cartData));
    setCart(orderData);
    alert("Added to cart!!");
  };

  return (
    <div className="product-details">
      <div className="product-main">
        <div className="product-image">
          {product.images && (
            <img
              src={`${DOMAIN_URL}${product.images[0]}`}
              alt={product.name}
              width={"250px"}
              height={"250px"}
            />
          )}
        </div>
        <div className="product-info">
          <h2>{product.name}</h2>
          <p>{product.line_description}</p>
          <p>prize - {product.prize} rs /kg</p>
          {cart ? (
            <Link to={"/cart"}>
              <button>Go to Cart</button>
            </Link>
          ) : (
            <p>
              <button onClick={handleOrder}>Add to Cart</button>
            </p>
          )}
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
            {benefits.map((benefit, inx) => (
              <li key={inx}>{benefit.trim()}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}