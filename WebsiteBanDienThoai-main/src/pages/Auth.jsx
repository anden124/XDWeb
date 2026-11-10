import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  
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
          alert("Đăng ký thành công! Mời bạn đăng nhập.");
          setIsLogin(true); 
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi nhập liệu, vui lòng kiểm tra lại!";
      alert("Thất bại: " + errorMsg);
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
            <input type="email" name="email" onChange={handleChange} placeholder="email@gmail.com" required />
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

          <button type="submit" className="btn-auth-submit">
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
