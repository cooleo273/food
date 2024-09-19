import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css'; // Import the CSS file

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        username,
        password,
      });
      if (response.data.isAdmin) {
        // Save the admin token in local storage or any auth context
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin');
      } else {
        setError('Access denied! You are not an admin.');
      }
    } catch (error) {
      setError('Invalid login credentials');
    }
  };

  return (
    <div className="admin-login-container">
        <div>
      
      <form onSubmit={handleSubmit} className="admin-login-form">
      <h4 className="admin-login-title">Login</h4>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="admin-login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="admin-login-input"
        />
        <button type="submit" className="admin-login-button">Login</button>
      </form>
      {error && <p className="admin-login-error">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;
