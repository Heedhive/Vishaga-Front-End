import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./signup.css"; // same CSS can be reused from login
import { DOMAIN_URL } from "../../constant";
import { useUser } from "../../utils";

export function Signup({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const {setUserInfo} = useUser()
  const handleSignup = () => {
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    fetch(`${DOMAIN_URL}signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, phone_number: phoneNumber, address}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Signup successful" && data.token) {
          localStorage.setItem("auth_token", data.token);
          setIsLoggedIn(true);
          navigate("/home");
          // Fetch and set user profile data
          fetch(`${DOMAIN_URL}user_profile`, {
            headers: {
              Authorization: `Bearer ${data.token}`,
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((profileData) => {
              setUserInfo(profileData);
            })
            .catch((err) => {
              console.error("Error fetching user profile:", err);
            });
        } else {
          setError(data.error || "Signup failed");
        }
      })
      .catch((err) => {
        console.error("Signup error:", err);
        setError("Server error. Please try again later.");
      });
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        <p>Sign up to get started</p>
        {error && <div className="error">{error}</div>}
        <input
          type="text"
          placeholder="Full Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          />
        <button onClick={handleSignup}>Sign Up</button>
        <p className="login-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
