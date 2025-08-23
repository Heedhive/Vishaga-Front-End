import { useState } from "react";
import { Link } from "react-router-dom";
import { DOMAIN_URL } from "../../constant";

import "./create.product.css"; // Import the CSS file for styling

export default function CreateProduct() {
  const [formData, setFormData] = useState({
    name: "",
    prize: "",
    details: "",
    lineDescription: "",
    benefit: "",
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      images: Array.from(e.target.files),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Example: Prepare FormData to send to backend
    const data = new FormData();
    data.append("name", formData.name);
    data.append("prize", formData.prize);
    data.append("details", formData.details);
    data.append("lineDescription", formData.lineDescription);
    data.append("benefit", formData.benefit);
    formData.images.forEach((file, index) => {
      data.append(`images`, file); // or `images[${index}]`
    });
    try {
      const res = await fetch(`${DOMAIN_URL}upload`, {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      alert(result.message || "Submitted!");
    } catch (err) {
      console.error("Upload failed", err);
    }

    setFormData({
      name: "",
      prize: "",
      details: "",
      images: [],
      lineDescription: "",
      benefit: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
      <div>
        <label>Name:</label>
        <br />
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Single line description:</label>
        <br />
        <input
          type="text"
          name="lineDescription"
          value={formData.lineDescription}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Details:</label>
        <br />
        <textarea
          style={{
            width: "100%",
            height: "100px",
            borderRadius: "5px",
          }}
          name="details"
          value={formData.details}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Prize:</label>
        <br />
        <input
          type="number"
          name="prize"
          value={formData.prize}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Benefit:</label>
        <br />
        <input
          type="text"
          name="benefit"
          value={formData.benefit}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Upload Images:</label>
        <br />
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      <div className="admin-create-actions">
        <button
          type="submit"
          className="admin-create-button"
        >
          Submit
        </button>
        <Link to={"/admin/dashboard"} className="admin-create-back">
          Back
        </Link>
      </div>
    </form>
  );
}
