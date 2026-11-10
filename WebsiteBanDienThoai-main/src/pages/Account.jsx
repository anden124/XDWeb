import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../style/Account.css';

const api = import.meta.env.VITE_API_BASE_URL;
const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export default function Account({ onProfileChange }) {
  const token = localStorage.getItem('access_token');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const options = {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    };
    Promise.all([
      axios.get(`${api}/api/profile`, options),
      axios.get(`${api}/api/orders`, { ...options, params: { page } }),
    ]).then(([profile, orders]) => {
      setData({ customer: profile.data.data, orders: orders.data.data });
    }).catch(requestError => {
      if (axios.isCancel(requestError)) return;
      if ([401, 403].includes(requestError.response?.status)) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
      setError('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
    });
    return () => controller.abort();
  }, [page, token]);

  function changePage(nextPage) {
    setError('');
    setData(null);
    setPage(nextPage);
  }

  function startEditing() {
    const { name, phone, address } = data.customer;
    setDraft({ name, phone: phone ?? '', address: address ?? '' });
    setProfileError('');
    setProfileSaved(false);
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (saving) return;

    const name = draft.name.trim();
    if (!name) {
      setProfileError('Vui lòng nhập họ tên.');
      return;
    }

    setProfileError('');
    setSaving(true);
    try {
      const response = await axios.post(`${api}/api/profile/update`, {
        name,
        phone: draft.phone.trim() || null,
        address: draft.address.trim() || null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      const customer = response.data.user_moi;
      setData(previous => ({ ...previous, customer }));
      localStorage.setItem('user', JSON.stringify(customer));
      onProfileChange(customer);
      setDraft(null);
      setProfileSaved(true);
    } catch (requestError) {
      const response = requestError.response?.data;
      const validationError = Object.values(response?.errors ?? {}).flat()[0];
      setProfileError(validationError || response?.message || 'Không thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="account-page">
      <div className="account-shell">
        <nav className="account-breadcrumb" aria-label="Đường dẫn">
          <Link to="/">Trang chủ</Link><span aria-hidden="true">/</span><span>Tài khoản</span>
        </nav>
        <header className="account-banner">
          <h1>Tài khoản và đơn hàng</h1>
          <p>Thông tin cá nhân và lịch sử mua hàng của bạn.</p>
        </header>
        {!token && <section className="account-card account-message">
          <h2>Đăng nhập để tiếp tục</h2>
          <p>Dùng tài khoản khách hàng để xem hồ sơ và đơn hàng.</p>
          <Link className="account-button" to="/login">Đăng nhập</Link>
        </section>}
        {token && error && <p className="account-card account-message" role="alert">{error}</p>}
        {token && !data && !error && <p className="account-card account-message" role="status">Đang tải thông tin...</p>}
        {token && data && <div className="account-layout">
          <section className="account-card account-profile">
            <div className="account-section-heading">
              <h2>Hồ sơ của tôi</h2>
              {!draft && <button type="button" className="account-outline" onClick={startEditing}>Chỉnh sửa</button>}
            </div>
            <div className="account-identity">
              <span className="account-avatar" aria-hidden="true">{data.customer.name.trim().charAt(0).toUpperCase()}</span>
              <strong>{data.customer.name}</strong>
            </div>
            {profileSaved && <p className="account-profile-saved" role="status">Đã lưu thông tin hồ sơ.</p>}
            {draft ? <form className="account-profile-form" onSubmit={saveProfile}>
              <label>Họ tên
                <input value={draft.name} required maxLength={255} autoComplete="name" disabled={saving}
                  onChange={event => setDraft({ ...draft, name: event.target.value })} />
              </label>
              <label>Email đăng nhập
                <input type="email" value={data.customer.email} readOnly />
              </label>
              <label>Số điện thoại
                <input type="tel" value={draft.phone} maxLength={20} autoComplete="tel" disabled={saving}
                  onChange={event => setDraft({ ...draft, phone: event.target.value })} />
              </label>
              <label>Địa chỉ
                <textarea value={draft.address} maxLength={255} rows={2} autoComplete="street-address" disabled={saving}
                  onChange={event => setDraft({ ...draft, address: event.target.value })} />
              </label>
              {profileError && <p className="account-profile-error" role="alert">{profileError}</p>}
              <div className="account-profile-actions">
                <button type="submit" className="account-button" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
                <button type="button" className="account-outline" disabled={saving} onClick={() => setDraft(null)}>Hủy</button>
              </div>
            </form> : <dl className="account-fields">
              <div><dt>Email</dt><dd>{data.customer.email}</dd></div>
              <div><dt>Số điện thoại</dt><dd>{data.customer.phone || 'Chưa cập nhật'}</dd></div>
              <div><dt>Địa chỉ</dt><dd>{data.customer.address || 'Chưa cập nhật'}</dd></div>
            </dl>}
          </section>
          <section className="account-card account-orders">
            <div className="account-section-heading">
              <h2>Đơn hàng của tôi</h2>
              <span className="account-count">{data.orders.total} đơn</span>
            </div>
            {data.orders.data.length === 0 && (
              <div className="account-empty">
                <div className="account-empty-icon" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 8h14l1.5 13h-17L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>
                  </svg>
                </div>
                <h3>Bạn chưa có đơn hàng</h3>
                <p>Đơn hàng mới sẽ xuất hiện ở đây sau khi bạn đặt hàng.</p>
                <Link className="account-button" to="/san-pham">Khám phá sản phẩm</Link>
              </div>
            )}
            {data.orders.data.map(order => (
              <details key={order.id} className="account-order">
                <summary>
                  <span className="account-order-title">
                    <strong>{order.order_code}</strong>
                    <small>{new Date(order.created_at).toLocaleDateString('vi-VN')}</small>
                  </span>
                  <span className="account-status" data-status={order.status}>{statusLabels[order.status] ?? order.status}</span>
                  <strong className="account-order-total">{currency.format(order.total_amount)}</strong>
                  <span className="account-chevron" aria-hidden="true" />
                </summary>
                <div className="account-order-body">
                  <p><strong>Địa chỉ nhận hàng</strong> · {order.address}</p>
                  <ul>{order.items.map(item => (
                    <li key={item.id}><span>{item.product_name}{item.variant_color && ` – ${item.variant_color}`} × {item.quantity}</span><strong>{currency.format(item.subtotal)}</strong></li>
                  ))}</ul>
                </div>
              </details>
            ))}
            {data.orders.last_page > 1 && (
              <div className="account-pagination">
                <button type="button" disabled={saving || page <= 1} onClick={() => changePage(page - 1)}>Trang trước</button>
                <span>{page} / {data.orders.last_page}</span>
                <button type="button" disabled={saving || page >= data.orders.last_page} onClick={() => changePage(page + 1)}>Trang sau</button>
              </div>
            )}
          </section>
        </div>}
      </div>
    </main>
  );
}
