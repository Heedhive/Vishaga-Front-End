import React from "react";
import { Card } from "./card";

import "./style.css";

import soaking from "../assest/soaking.png";
import drying from "../assest/drying.png";
import dehusking from "../assest/dehusking.png";
import polishing from "../assest/polishing.png";
import forming from "../assest/forming.png";
import packing from "../assest/packing.png";
import shipping from "../assest/shipping.png";

export function Gallery() {
  const cards = [
    { image: polishing, title: "sundrying (2 days)" },
    { image: soaking, title: "Soaking (12 hours)" },
    { image: dehusking, title: "Boiling (Depends upon the rice time varies)" },
    { image: polishing, title: "Sundrying (1 Day)" },
    { image: forming, title: "Dry In the Evening next day" },
    { image: drying, title: "Handpounding Process" },
    { image: dehusking, title: "Dust Removal , Stones , Broken Rice" },
    { image: packing, title: "Packing" },
    { image: shipping, title: "Shipping" },
  ];

  return (
    <div className="gallery-wrapper">
      <h1 className="gallery-content">Our processing Rice Journey</h1>
      <div className="gallery-grid">
        {cards.map((card, index) => (
          <div className="gallery-item" key={index}>
            <Card image={card.image} title={card.title} />
            {index < cards.length - 1 && <div className="arrow">→</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
