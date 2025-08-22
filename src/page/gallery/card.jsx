import React from "react";

import "./style.css";

export function Card({ image, title }) {
  return (
    <div className="gallery-card">
      <img src={image} alt={title} />
      <div className="card-title-container">
        <h3>{title}</h3>
      </div>
    </div>
  );
}
