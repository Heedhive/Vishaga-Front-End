import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import "./product.css";
import { DOMAIN_URL } from "../../constant";

export function Products() {
  const [products, setProducts] = React.useState([]);
  
  useEffect(function getProducts() {
    fetch(`${DOMAIN_URL}/products`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);
  return (
    <section className="products-wrapper">
      <h1>PRODUCTS</h1>
      <p>We offer pure, nutrient-rich handpounded rice, grown by local farmers and carefully processed to its wholesome goodness and traditional flavor.</p>

      <div className="products-grid">
        {products && products.map((product, index) => (
          <div className="product-card" key={index}>
            {product.images && product.images[0] && <img src={`${DOMAIN_URL}${product.images[0]}`} alt={product.name} />}
            <div className="product-info">
              <h3>{product.name}</h3>
              <h3>{product.prize}</h3>
              <p>{product.details}</p>
              <ul>
                {/* {product.benefits.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))} */}
              </ul>
              <Link className="order-button" to={`/product/${product.id}`}>Details</Link>
            </div>
          </div>
        ))}
      </div>
      
    </section>
  );
}
