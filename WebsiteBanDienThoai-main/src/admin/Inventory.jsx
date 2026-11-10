import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminListPager, AdminSearch, useAdminList } from './AdminSearch';

const productsApi = `${import.meta.env.VITE_API_BASE_URL}/api/admin/products`;

export default function Inventory() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const list = useAdminList(productsApi, token);
  const [active, setActive] = useState(null);
  const [operation, setOperation] = useState('receive');
  const [quantity, setQuantity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const products = list.result?.data ?? [];
  const rows = products.flatMap(product => (product.variants?.length ? product.variants : [null]).map(variant => ({
    key: `${product.id}:${variant?.id ?? 'base'}`,
    product,
    variant,
    stock: Number(variant?.quantity ?? product.quantity),
  })));

  function openAdjustment(key) {
    setActive(key);
    setOperation('receive');
    setQuantity('');
    setError('');
    setNotice('');
  }

  async function adjust(event, row) {
    event.preventDefault();
    if (saving) return;
    setError('');
    setSaving(true);
    try {
      const response = await axios.patch(`${productsApi}/${row.product.id}/stock`, {
        operation, quantity: Number(quantity), product_variant_id: row.variant?.id ?? null,
      }, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      const title = row.variant ? `${row.product.name} · ${row.variant.color}` : row.product.name;
      setNotice(`${title}: còn ${response.data.data.quantity} sản phẩm trong kho.`);
      setActive(null);
      list.reload();
    } catch (requestError) {
      if ([401, 403].includes(requestError.response?.status)) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
        return;
      }
      const response = requestError.response?.data;
      setError(Object.values(response?.errors ?? {}).flat()[0] || response?.message || 'Không thể cập nhật tồn kho.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-card">
      <header className="admin-product-heading">
        <div>
          <h1>Quản lý kho hàng</h1>
          <p>Theo dõi tồn kho và nhập hoặc xuất hàng theo từng màu.</p>
        </div>
      </header>
      {notice && <p className="admin-product-notice" role="status">{notice}</p>}
      <AdminSearch label="Tìm sản phẩm trong kho" placeholder="Tên, hãng, mã SKU hoặc model" disabled={saving}
        onSearch={value => {
          openAdjustment(null);
          list.search(value);
        }} />
      {list.error && <p className="admin-product-error" role="alert">{list.error}</p>}
      {!list.result && !list.error && <p role="status">Đang tải tồn kho...</p>}
      {list.result && !rows.length && <p role="status">Không tìm thấy sản phẩm phù hợp.</p>}
      {rows.length > 0 && (
        <div className="admin-product-table">
          <table className="admin-table">
            <thead><tr><th>Sản phẩm</th><th>Màu</th><th>Tồn kho</th><th>Thao tác</th></tr></thead>
            <tbody>{rows.map(row => (
              <Fragment key={row.key}>
                <tr>
                  <td><strong>{row.product.name}</strong><small className="admin-variant-count">{row.product.brand}</small></td>
                  <td>{row.variant?.color || row.product.color || '—'}</td>
                  <td><span className={row.stock === 0 ? 'inventory-out' : 'inventory-in'}>{row.stock === 0 ? 'Hết hàng' : row.stock}</span></td>
                  <td><button type="button" className="btn-edit" disabled={saving}
                    onClick={() => openAdjustment(row.key)}>Điều chỉnh</button></td>
                </tr>
                {active === row.key && <tr>
                  <td colSpan={4}>
                    <form className="inventory-adjustment" onSubmit={event => adjust(event, row)}>
                      <label>Thao tác
                        <select value={operation} disabled={saving} onChange={event => setOperation(event.target.value)}>
                          <option value="receive">Nhập kho</option>
                          <option value="issue">Xuất kho</option>
                        </select>
                      </label>
                      <label>Số lượng
                        <input type="number" min="1" max="2147483647" step="1" required value={quantity} disabled={saving}
                          onChange={event => setQuantity(event.target.value)} />
                      </label>
                      <button type="submit" className="admin-product-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu tồn kho'}</button>
                      <button type="button" className="admin-search-clear" disabled={saving} onClick={() => setActive(null)}>Hủy</button>
                      {error && <p className="admin-product-error" role="alert">{error}</p>}
                    </form>
                  </td>
                </tr>}
              </Fragment>
            ))}</tbody>
          </table>
        </div>
      )}
      <AdminListPager page={list.page} lastPage={list.result?.last_page} disabled={saving} onChange={value => {
        openAdjustment(null);
        list.changePage(value);
      }} />
    </section>
  );
}
