import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

function Admin() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    name: '', brand: '', price: '', sale_price: '', image: null, category_id: '1', quantity: '10' 
  });
  
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      const data = res.data?.data?.data || res.data?.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      handleApiError(error);
    }
  }, [token, API_BASE]);

  useEffect(() => {
    if (!token) navigate('/admin/login');
    else fetchProducts();
  }, [token, navigate, fetchProducts]);

  const handleInput = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') setForm({ ...form, image: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      brand: item.brand,
      price: item.price,
      sale_price: item.sale_price || '',
      category_id: item.category_id || '1',
      quantity: item.quantity,
      image: null 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', brand: '', price: '', sale_price: '', image: null, category_id: '1', quantity: '10' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => {
        if (key === 'image') {
            if (form.image instanceof File) formData.append('image', form.image);
        } else {
            formData.append(key, form[key] || '');
        }
    });

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      };

      if (editingId) {
        formData.append('_method', 'PUT'); 
        await axios.post(`${API_BASE}/api/admin/products/${editingId}`, formData, config);
        alert("Cập nhật thành công!");
      } else {
        await axios.post(`${API_BASE}/api/admin/products`, formData, config);
        alert("Thêm mới thành công!");
      }
      cancelEdit();
      fetchProducts(); 
    } catch (error) {
      console.error("Lỗi:", error.response?.data);
      alert("Có lỗi xảy ra, Sơn kiểm tra Console nhé!");
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      try {
        await axios.delete(`${API_BASE}/api/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
      } catch (error) { handleApiError(error); }
    }
  };

  const handleApiError = (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      navigate('/admin/login');
    }
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>ADMIN</h2>
        <ul>
          <li className="active">📦 Quản lý sản phẩm</li>
          <li
           onClick={() => navigate('/admin/users')}
           style={{cursor:'pointer'}}
          >
           👤 Quản lý User
          </li>
          <li
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            🏠 Về Trang Chủ
          </li>
          <li onClick={() => { localStorage.removeItem('admin_token'); navigate('/admin/login'); }} style={{cursor: 'pointer'}}>🚪 Đăng xuất</li>
        </ul>
      </aside>

      <main className="admin-main">
        <div className="admin-card">
          <h1>{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h1>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <input name="name" placeholder="Tên" onChange={handleInput} value={form.name} required />
              <input name="brand" placeholder="Hãng" onChange={handleInput} value={form.brand} required />
              <input name="price" type="number" placeholder="Giá gốc" onChange={handleInput} value={form.price} required />
              <input name="sale_price" type="number" placeholder="Giá KM" onChange={handleInput} value={form.sale_price} />
              <input name="quantity" type="number" placeholder="Số lượng" onChange={handleInput} value={form.quantity} required />
              <input name="image" type="file" onChange={handleInput} accept="image/*" />
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-add">{editingId ? "Cập nhật" : "Thêm mới"}</button>
                {editingId && <button type="button" className="btn-delete" onClick={cancelEdit}>Hủy</button>}
            </div>
          </form>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(item => (
                <tr key={item.id}>
                  <td>
                    <img 
                      src={`${API_BASE}/${item.image?.replace('storage/', '')}`} 
                      alt="" width="50" 
                      onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                      style={{ borderRadius: '5px', objectFit: 'cover' }}
                    />
                  </td>
                  <td><b>{item.name}</b></td>
                  <td>{Number(item.price).toLocaleString()}đ</td>
                  <td>
                    <button onClick={() => handleEditClick(item)} className="btn-add" style={{backgroundColor: '#f39c12', padding: '5px 10px'}}>Sửa</button>
                    <button onClick={() => deleteProduct(item.id)} className="btn-delete" style={{padding: '5px 10px', marginLeft: '5px'}}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Admin;