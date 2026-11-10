import axios from 'axios';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminListPager, AdminSearch, useAdminList } from './AdminSearch';
import './Admin.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const productsApi = `${API_BASE}/api/admin/products`;
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const navigation = [
  ['Danh mục và kho', [
    ['/admin/brands', '🏷️', 'Quản lý hãng'],
    ['/admin', '📦', 'Quản lý sản phẩm'],
    ['/admin/inventory', '🏬', 'Quản lý kho hàng'],
  ]],
  ['Bán hàng', [
    ['/admin/orders', '🧾', 'Quản lý đơn hàng'],
    ['/admin/users', '👤', 'Quản lý người dùng'],
  ]],
];

export default function Admin() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="admin-container admin-product-shell">
      <aside className="sidebar">
        <h2>ADMIN</h2>
        <nav aria-label="Quản trị">
          {navigation.map(([heading, links]) => <div className="admin-nav-group" key={heading}>
            <p>{heading}</p>
            <ul>{links.map(([path, icon, name]) => {
              const active = pathname === path || (path === '/admin' && pathname.startsWith('/admin/products/'));
              return <li className={active ? 'active' : ''} key={path}>
                <Link to={path} aria-current={active ? 'page' : undefined}><span aria-hidden="true">{icon}</span> {name}</Link>
              </li>;
            })}</ul>
          </div>)}
        </nav>
        <ul className="admin-nav-exit">
          <li><Link to="/">🏠 Về Trang Chủ</Link></li>
          <li><button type="button" onClick={() => {
            localStorage.removeItem('admin_token');
            navigate('/admin/login');
          }}>🚪 Đăng xuất</button></li>
        </ul>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  );
}

export function AdminProductList() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = localStorage.getItem('admin_token');
  const list = useAdminList(productsApi, token);
  const products = list.result?.data ?? [];

  async function deleteProduct(id) {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await axios.delete(`${productsApi}/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      list.reload();
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
        return;
      }
      alert(error.response?.data?.message || 'Không thể xóa sản phẩm.');
    }
  }

  return (
    <section className="admin-card admin-product-list">
      <header className="admin-product-heading">
        <div>
          <h1>Quản lý sản phẩm</h1>
          <p>{list.result ? `${list.result.total} sản phẩm${list.keyword ? ' phù hợp' : ''}` : 'Danh sách sản phẩm trong cửa hàng'}</p>
        </div>
        <Link className="admin-product-primary" to="/admin/products/new">+ Thêm sản phẩm</Link>
      </header>
      {state?.notice && <p className="admin-product-notice" role="status">{state.notice}</p>}
      <AdminSearch label="Tìm sản phẩm" placeholder="Tên, hãng, mã SKU hoặc model" onSearch={list.search} />
      {list.error && <p className="admin-product-error" role="alert">{list.error}</p>}
      {!list.result && !list.error && <p role="status">Đang tải sản phẩm...</p>}
      {list.result && !products.length && <p role="status">{list.keyword ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có sản phẩm.'}</p>}
      {products.length > 0 && <div className="admin-product-table">
        <table className="admin-table">
          <thead><tr><th>Sản phẩm</th><th>Giá bán</th><th>Tồn kho</th><th>Thao tác</th></tr></thead>
          <tbody>{products.map(item => {
            const variantCount = item.variants?.length ?? 0;
            const stock = variantCount ? item.variants.reduce((sum, variant) => sum + Number(variant.quantity), 0) : item.quantity;
            const sale = Number(item.sale_price) > 0 && Number(item.sale_price) < Number(item.price);
            return <tr key={item.id}>
              <td><div className="admin-product-summary">
                {item.image && <img src={`${API_BASE}/${item.image.replace('storage/', '')}`} alt="" width="48" height="48" />}
                <div><strong>{item.name}</strong>
                  <small>{[item.brand, variantCount ? `${variantCount} màu` : item.color].filter(Boolean).join(' · ')}</small>
                </div>
              </div></td>
              <td><strong>{variantCount > 1 && 'Từ '}{currency.format(sale ? item.sale_price : item.price)}</strong>
                {sale && <del className="admin-product-old-price">{currency.format(item.price)}</del>}
              </td>
              <td>{stock ?? '—'}</td>
              <td><div className="admin-product-row-actions">
                <Link className="btn-edit" to={`/admin/products/${item.id}/edit`}>Sửa</Link>
                <button type="button" className="btn-delete" onClick={() => deleteProduct(item.id)}>Xóa</button>
              </div></td>
            </tr>;
          })}</tbody>
        </table>
      </div>}
      <AdminListPager page={list.page} lastPage={list.result?.last_page} onChange={list.changePage} />
    </section>
  );
}
