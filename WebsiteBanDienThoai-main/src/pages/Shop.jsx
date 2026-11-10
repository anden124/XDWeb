import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import SidebarFilter from '../components/SidebarFilter';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(searchParams.entries());
        const queryString = new URLSearchParams(params).toString();
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/products/search?${queryString}`;
        const res = await axios.get(url);
        setProducts(res.data?.data || []);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);

  return (
    <div className="shop-page" style={{ background: '#f4f4f4', minHeight: '100vh', padding: '20px 0' }}>
      <div className="container" style={{ maxWidth: '1400px' }}> {/* Container rộng để đủ chỗ cho 5 cột */}
        
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* SIDEBAR: Khóa cứng độ rộng 280px để không lấn chiếm Content */}
          <aside style={{ width: '280px', flexShrink: 0 }}>
            <SidebarFilter />
          </aside>

          {/* CONTENT: Tự động chiếm phần còn lại */}
          <section style={{ flex: 1 }}>
            <div className="bg-white p-4 rounded-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0 text-uppercase" style={{ fontSize: '18px' }}>
                  {keyword ? `Kết quả cho: "${keyword}"` : "Tất cả sản phẩm"}
                </h4>
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                  {products.length} sản phẩm
                </span>
              </div>

              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>
              ) : (
                /* DÙNG ĐÚNG CLASS CSS CỦA TRANG CHỦ */
                <div className="product-grid-5"> 
                  {products.map((item) => (
                    <Link 
                     to={`/product/${item.id}`} 
                     key={item.id} 
                     style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="product-card">
                        {item.sale_price > 0 && (
                          <div className="sale-badge">
                            -{Math.round(((item.price - item.sale_price) / item.price) * 100)}%
                          </div>
                        )}
                        <div className="product-img-wrap">
                          <img 
                            src={`${import.meta.env.VITE_API_BASE_URL}/${item.image}`} 
                            alt={item.name}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Smartphone'; }}
                          />
                        </div>
                        <div className="product-detail text-center">
                          <p className="product-brand mb-1">{item.brand}</p>
                          <h3 className="product-name fs-6 fw-bold">{item.name}</h3>
                          <div className="product-price mb-2">
                            {item.sale_price > 0 ? (
                              <>
                                <span className="price-new text-danger fw-bold">{parseInt(item.sale_price).toLocaleString()}₫</span>
                                <div className="price-old text-muted text-decoration-line-through small">{parseInt(item.price).toLocaleString()}₫</div>
                              </>
                            ) : (
                              <span className="price-new fw-bold">{parseInt(item.price).toLocaleString()}₫</span>
                            )}
                          </div>
                            <button className="btn-add-cart">Thêm vào giỏ</button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Shop;