import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.login.css'; // You can create this CSS file for styling
import { DOMAIN_URL } from '../../constant';

export function AdminLogin({ setIsAdminLoggedIn }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(`${DOMAIN_URL}admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('is_admin', 'true');
        setIsAdminLoggedIn(true);
        navigate('/admin/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid admin credentials');
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      setError('An error occurred. Please try again.');
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
