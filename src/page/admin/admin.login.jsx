import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.login.css'; // You can create this CSS file for styling

export function AdminLogin({ setIsAdminLoggedIn }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // HARDCODED ADMIN CREDENTIALS - DO NOT USE IN PRODUCTION
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'adminpassword'; 

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('is_admin', 'true'); // Store admin status
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Admin Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login as Admin</button>
      </div>
    </div>
  );
}