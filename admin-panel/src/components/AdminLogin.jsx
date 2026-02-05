import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('admin@intellisync.io');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_logged_in', 'true');
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '80px auto', padding: 24, boxShadow: '0 2px 12px #0001', borderRadius: 8, background: '#fff' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }}
          required
        />
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }}
          required
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 4, background: '#0078d4', color: '#fff', border: 'none', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
} 