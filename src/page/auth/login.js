import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { DOMAIN_URL } from '../../constant';

export function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
  
    fetch(`${DOMAIN_URL}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          setIsLoggedIn(true);
          navigate('/home');
        } else {
          setError(data.error || "Login failed");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        setError("Server error. Please try again later.");
      });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button className="auth-button" onClick={handleLogin}>Login</button>
        <p className="auth-link">Don't have an account? <a href="/signup">Sign up</a></p>
      </div>
    </div>
  );
}
