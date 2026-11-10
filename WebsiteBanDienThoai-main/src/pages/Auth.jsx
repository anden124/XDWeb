import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../style/Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const [notice, setNotice] = useState(query.get('verified') === '1' ? 'Email đã được xác nhận. Bạn có thể đăng nhập.' : '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setNotice('');
    setError('');
    setBusy(true);
    const url = isLogin ? `${import.meta.env.VITE_API_BASE_URL}/api/login` : `${import.meta.env.VITE_API_BASE_URL}/api/register`;

    try {
      const response = await axios.post(url, formData);
      if (response.data.status === 'success') {
        if (isLogin) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          if(response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
          }
          alert("Chào mừng " + response.data.user.name + " đã quay trở lại!");
          window.location.href = import.meta.env.BASE_URL;
        } else {
          setNotice(response.data.message);
          setIsLogin(true);
        }
      }
    } catch (error) {
      const response = error.response?.data;
      setError(Object.values(response?.errors ?? {}).flat()[0] || response?.message || 'Không thể tiếp tục. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const resendEmail = async () => {
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email cần xác nhận.');
      return;
    }
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/email/resend`, { email: formData.email.trim() });
      setNotice(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể gửi lại email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>ĐĂNG NHẬP</button>
          <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>ĐĂNG KÝ</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h1 className="logo-text" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>PHONESTORE</h1>
          <p className="auth-subtitle">{isLogin ? "Vui lòng đăng nhập để tiếp tục" : "Tạo tài khoản mới để mua sắm"}</p>
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          {error && <p className="auth-notice auth-notice-error" role="alert">{error}</p>}
          
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Họ và tên</label>
                <input type="text" name="name" onChange={handleChange} placeholder="Nguyễn Văn A" required />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="text" name="phone" onChange={handleChange} placeholder="09xxx..." />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@gmail.com" required />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input type="password" name="password" onChange={handleChange} placeholder="••••••••" required />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input type="password" name="password_confirmation" onChange={handleChange} placeholder="••••••••" required />
            </div>
          )}

          {isLogin && import.meta.env.VITE_CUSTOMER_EMAIL_ENABLED !== 'false' && <div className="auth-help-links">
            <Link to="/quen-mat-khau">Quên mật khẩu?</Link>
            <button type="button" onClick={resendEmail} disabled={busy}>Gửi lại email xác nhận</button>
          </div>}
          <button type="submit" className="btn-auth-submit" disabled={busy}>
            {isLogin ? "Đăng nhập ngay" : "Tạo tài khoản"}
          </button>

          <div className="auth-back-home">
            <span onClick={() => navigate('/')}>← Quay lại trang chủ</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
