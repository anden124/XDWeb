import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminListPager, AdminSearch, useAdminList } from './AdminSearch';

const endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/admin/brands`;

export default function Brands() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const list = useAdminList(endpoint, token);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const brands = list.result?.data ?? [];
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

  function edit(brand) {
    setEditing(brand?.id ?? null);
    setName(brand?.name ?? '');
    setError('');
    setNotice('');
  }

  function showError(requestError) {
    if ([401, 403].includes(requestError.response?.status)) {
      localStorage.removeItem('admin_token');
      navigate('/admin/login', { replace: true });
      return;
    }
    const response = requestError.response?.data;
    setError(Object.values(response?.errors ?? {}).flat()[0] || response?.message || 'Không thể lưu thay đổi.');
  }

  async function save(event) {
    event.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const data = { name: name.trim() };
      if (editing) {
        await axios.put(`${endpoint}/${editing}`, data, { headers });
      } else {
        await axios.post(endpoint, data, { headers });
      }
      edit(null);
      setNotice(editing ? 'Đã cập nhật hãng.' : 'Đã thêm hãng.');
      list.reload();
    } catch (requestError) {
      showError(requestError);
    } finally {
      setBusy(false);
    }
  }

  async function remove(brand) {
    if (busy || !window.confirm(`Xóa hãng ${brand.name}?`)) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await axios.delete(`${endpoint}/${brand.id}`, { headers });
      if (editing === brand.id) edit(null);
      setNotice('Đã xóa hãng.');
      list.reload();
    } catch (requestError) {
      showError(requestError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-card">
      <header className="admin-product-heading">
        <div><h1>Quản lý hãng</h1><p>Danh sách hãng dùng khi thêm hoặc sửa sản phẩm.</p></div>
      </header>
      <form className="admin-list-search" onSubmit={save}>
        <label>
          <span>{editing ? 'Sửa tên hãng' : 'Tên hãng mới'}</span>
          <input value={name} placeholder="Ví dụ: Samsung" maxLength={255} required disabled={busy}
            onChange={event => setName(event.target.value)} />
        </label>
        <button type="submit" className="admin-product-primary" disabled={busy}>
          {editing ? 'Lưu thay đổi' : '+ Thêm hãng'}
        </button>
        {editing && <button type="button" className="admin-search-clear" disabled={busy} onClick={() => edit(null)}>Hủy</button>}
      </form>
      {error && <p role="alert" className="admin-product-error">{error}</p>}
      {notice && <p role="status" className="admin-product-notice">{notice}</p>}
      <AdminSearch label="Tìm hãng" placeholder="Nhập tên hãng" onSearch={list.search} disabled={busy} />
      {list.error && <p role="alert" className="admin-product-error">{list.error}</p>}
      {!list.result && !list.error && <p role="status">Đang tải danh sách hãng...</p>}
      {list.result && !brands.length && <p role="status">Không tìm thấy hãng phù hợp.</p>}
      {brands.length > 0 && <div className="admin-product-table">
        <table className="admin-table">
          <thead><tr><th>Tên hãng</th><th>Số sản phẩm</th><th>Thao tác</th></tr></thead>
          <tbody>{brands.map(brand => <tr key={brand.id}>
            <td><strong>{brand.name}</strong></td>
            <td>{brand.product_count}</td>
            <td><div className="admin-product-row-actions">
              <button type="button" className="btn-edit" disabled={busy} onClick={() => edit(brand)}>Sửa</button>
              <button type="button" className="btn-delete" disabled={busy || Number(brand.product_count) > 0}
                onClick={() => remove(brand)}>Xóa</button>
            </div></td>
          </tr>)}</tbody>
        </table>
      </div>}
      <AdminListPager page={list.page} lastPage={list.result?.last_page} disabled={busy} onChange={list.changePage} />
    </section>
  );
}
