import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminListPager, AdminSearch, useAdminList } from './AdminSearch';
import { orderStatusLabels as statuses, orderCurrency as currency } from './orderDisplay';
import './Admin.css';

const api = `${import.meta.env.VITE_API_BASE_URL}/api/admin/orders`;

export default function Orders() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const { page, result, setResult, error, setError, keyword, search, changePage } = useAdminList(api, token);
  const [selectedId, setSelectedId] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const orders = result?.data ?? [];
  const selected = orders.find(order => order.id === selectedId);
  const isFinal = selected?.status === 'cancelled' || selected?.status === 'completed';

  async function saveStatus(event) {
    event.preventDefault();
    if (!selected || saving || nextStatus === selected.status) return;

    setError('');
    setSaving(true);
    try {
      const { data } = await axios.put(`${api}/${selected.id}/status`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(previous => ({
        ...previous,
        data: previous.data.map(order =>
          order.id === selected.id ? { ...order, status: data.data.status } : order
        ),
      }));
    } catch (requestError) {
      if ([401, 403].includes(requestError.response?.status)) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(requestError.response?.data?.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-card">
          <h1>Quản lý đơn hàng</h1>
          <AdminSearch label="Tìm đơn hàng" placeholder="Mã đơn, tên khách hoặc số điện thoại" disabled={saving}
            onSearch={value => {
              setSelectedId(null);
              search(value);
            }} />
          {error && <p role="alert">{error}</p>}
          {!result && !error && <p>Đang tải đơn hàng...</p>}
          {result && orders.length === 0 && <p role="status">{keyword ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng.'}</p>}
          {orders.length > 0 && (
            <div className="admin-orders-table">
              <table className="admin-table">
                <thead><tr>
                  <th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th>
                  <th>Trạng thái</th><th>Thao tác</th>
                </tr></thead>
                <tbody>{orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.order_code}</td>
                    <td>{order.customer_name}</td>
                    <td>{currency.format(order.total_amount)}</td>
                    <td>{statuses[order.status] ?? order.status}</td>
                    <td><button type="button" className="btn-edit" disabled={saving}
                      onClick={() => {
                        setError('');
                        setSelectedId(order.id);
                        setNextStatus(order.status);
                      }}>Xem chi tiết</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <AdminListPager page={page} lastPage={result?.last_page} disabled={saving} onChange={value => {
            setSelectedId(null);
            changePage(value);
          }} />
          {selected && (
            <section className="admin-order-detail">
              <h2>Đơn {selected.order_code}</h2>
              <p>{selected.customer_name} · {selected.phone}{selected.email && ` · ${selected.email}`}</p>
              <p>{selected.address}</p>
              {selected.note && <p>Ghi chú: {selected.note}</p>}
              <p>Thanh toán: {selected.payment_method === 'banking' ? 'Chuyển khoản' : 'COD'}</p>
              <ul>{selected.items.map(item => (
                <li key={item.id}>{item.product_name}{item.variant_color && ` – ${item.variant_color}`} × {item.quantity} — {currency.format(item.subtotal)}</li>
              ))}</ul>
              <p>Phí giao hàng: {currency.format(selected.shipping_fee)}</p>
              <p><strong>Tổng cộng: {currency.format(selected.total_amount)}</strong></p>
              <form className="admin-order-actions" onSubmit={saveStatus}>
                <label htmlFor="order-status">Trạng thái</label>
                <select id="order-status" value={nextStatus} disabled={saving || isFinal}
                  onChange={event => setNextStatus(event.target.value)}>
                  {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <button type="submit" className="btn-add" disabled={saving || selected.status === nextStatus}>Lưu trạng thái</button>
              </form>
            </section>
          )}
        </section>
  );
}
