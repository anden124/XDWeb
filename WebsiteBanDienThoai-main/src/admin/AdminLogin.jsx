import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Thêm loading
  const navigate = useNavigate();

  const handleChange = (e) => {
    // Cập nhật state chính xác
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Bắt đầu load
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/login`, credentials);
      
      // Kiểm tra xem backend trả về biến tên là gì (access_token hay token)
      const token = res.data.access_token || res.data.token;
      
      if (token) {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(res.data.user));
        
        alert('Đăng nhập Admin thành công!');
        navigate('/admin');
      } else {
        setError('Không nhận được mã xác thực từ máy chủ!');
      }
    } catch (err) {
      // Bắt lỗi chi tiết hơn từ Laravel
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Email hoặc mật khẩu Admin không đúng!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1e293b' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#1e293b', fontWeight: 'bold' }}>ADMIN LOGIN</h2>
        
        {error && (
          <p style={{ color: '#ef4444', background: '#fee2e2', padding: '10px', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </p>
        )}
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px' }}>Email Admin:</label>
          <input 
            type="email" 
            name="email" 
            value={credentials.email} // Thêm value
            onChange={handleChange} 
            required 
            placeholder="admin@example.com"
            style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px' }}>Mật khẩu:</label>
          <input 
            type="password" 
            name="password" 
            value={credentials.password} // Thêm value
            onChange={handleChange} 
            required 
            placeholder="••••••••"
            style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} // Vô hiệu hóa khi đang load
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: loading ? '#94a3b8' : '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            fontWeight: 'bold',
            transition: '0.3s'
          }}
        >
          {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
           <a href="/" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>← Quay lại trang chủ</a>
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;