import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DOMAIN_URL } from "../../constant";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    prize: "",
    details: "",
    images: [],
  });
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetch(`${DOMAIN_URL}products/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          name: data.name,
          prize: data.prize,
          details: data.details,
          images: [],
        });
        setExistingImages(data.images);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, images: Array.from(e.target.files) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("prize", formData.prize);
    data.append("details", formData.details);
    formData.images.forEach((img) => data.append("images", img));

    const res = await fetch(`${DOMAIN_URL}products/${id}`, {
      method: "PUT",
      body: data,
    });

    const result = await res.json();
    alert(result.message);
    navigate("/admin/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Edit Product</h2>

      <div>
        <label>Name:</label><br />
        <input name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div>
        <label>Prize:</label><br />
        <input type="number" name="prize" value={formData.prize} onChange={handleChange} required />
      </div>

      <div>
        <label>Details:</label><br />
        <textarea name="details" value={formData.details} onChange={handleChange} required />
      </div>

      <div>
        <label>Current Images:</label><br />
        {existingImages.map((img, i) => (
          <img key={i} src={`${DOMAIN_URL}${img}`} width="100" alt="Old" />
        ))}
      </div>

      <div>
        <label>Replace Images:</label><br />
        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
      </div>

      <button type="submit" style={{ marginTop: "10px" }}>Update</button>
    </form>
  );
}
