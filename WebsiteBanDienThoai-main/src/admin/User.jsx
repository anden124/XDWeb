import { Fragment, useState } from 'react';
import axios from 'axios';
import { AdminListPager, AdminSearch, useAdminList } from './AdminSearch';
import { orderStatusLabels, orderCurrency } from './orderDisplay';
import './Admin.css';

const api = `${import.meta.env.VITE_API_BASE_URL}/api/admin`;
const dateFormat = new Intl.DateTimeFormat('vi-VN');

function UserOrders({ user, token }) {
  const list = useAdminList(`${api}/orders?user_id=${user.id}`, token);
  const orders = list.result?.data ?? [];

  return (
    <section className="admin-user-orders" aria-labelledby={`user-orders-title-${user.id}`}>
      <h2 id={`user-orders-title-${user.id}`}>Đơn hàng của {user.name}</h2>
      {list.error && <p className="admin-product-error" role="alert">{list.error}</p>}
      {!list.result && !list.error && <p role="status">Đang tải đơn hàng...</p>}
      {list.result && !orders.length && <p>Chưa có đơn hàng.</p>}
      {orders.map(order => (
        <details className="admin-user-order" key={order.id}>
          <summary>
            <strong>{order.order_code}</strong>
            <span>{dateFormat.format(new Date(order.created_at))}</span>
            <span>{orderStatusLabels[order.status] ?? order.status}</span>
            <strong>{orderCurrency.format(order.total_amount)}</strong>
          </summary>
          <div className="admin-user-order-body">
            <p>Người nhận: {order.customer_name} · {order.phone}</p>
            <p>Địa chỉ: {order.address}</p>
            <p>Thanh toán: {order.payment_method === 'banking' ? 'Chuyển khoản' : 'COD'}</p>
            {order.note && <p>Ghi chú: {order.note}</p>}
            <ul>{order.items.map(item => (
              <li key={item.id}>
                {item.product_name}{item.variant_color && ` – ${item.variant_color}`} × {item.quantity}
                {' · '}{orderCurrency.format(item.subtotal)}
              </li>
            ))}</ul>
          </div>
        </details>
      ))}
      <AdminListPager page={list.page} lastPage={list.result?.last_page} onChange={list.changePage} />
    </section>
  );
}

export default function User() {
  const token = localStorage.getItem('admin_token');
  const list = useAdminList(`${api}/users`, token);
  const [expandedId, setExpandedId] = useState(null);
  const users = list.result?.data ?? [];

  async function deleteUser(id) {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await axios.delete(`${api}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (expandedId === id) setExpandedId(null);
      alert('Xóa người dùng thành công.');
      list.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xóa người dùng.');
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-header-row"><h1>Quản lý người dùng</h1></div>
      <AdminSearch label="Tìm người dùng" placeholder="Họ tên, email hoặc số điện thoại" onSearch={value => {
        setExpandedId(null);
        list.search(value);
      }} />
      {list.error && <p role="alert">{list.error}</p>}
      {!list.result && !list.error && <p role="status">Đang tải người dùng...</p>}
      {list.result && !users.length && <p role="status">{list.keyword ? 'Không tìm thấy người dùng phù hợp.' : 'Chưa có người dùng.'}</p>}
      {users.length > 0 && <div className="admin-product-table">
        <table className="admin-table">
          <thead><tr>
            <th>ID</th><th>Tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th>
            <th>Trạng thái</th><th>Đơn đã đặt</th><th>Thao tác</th>
          </tr></thead>
          <tbody>{users.map(user => {
            const expanded = expandedId === user.id;
            return <Fragment key={user.id}>
              <tr>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '—'}</td>
                <td><span className={user.role === 'admin' ? 'role-admin' : 'role-user'}>{user.role}</span></td>
                <td><span className={user.status ? 'role-user' : 'role-admin'}>{user.status ? 'Hoạt động' : 'Khóa'}</span></td>
                <td>{Number(user.orders_count) > 0
                  ? <div className="admin-product-row-actions">
                    <span className="inventory-in">{user.orders_count} đơn</span>
                    <button type="button" className="admin-user-orders-toggle" aria-expanded={expanded}
                      onClick={() => setExpandedId(expanded ? null : user.id)}>
                      {expanded ? 'Ẩn đơn hàng' : 'Xem đơn hàng'}
                    </button>
                  </div>
                  : 'Chưa đặt'}</td>
                <td>{user.role !== 'admin' && (
                  <button type="button" className="btn-delete" onClick={() => deleteUser(user.id)}>Xóa</button>
                )}</td>
              </tr>
              {expanded && <tr><td colSpan={8}><UserOrders user={user} token={token} /></td></tr>}
            </Fragment>;
          })}</tbody>
        </table>
      </div>}
      <AdminListPager page={list.page} lastPage={list.result?.last_page} onChange={value => {
        setExpandedId(null);
        list.changePage(value);
      }} />
    </section>
  );
}
