import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import SidebarFilter from '../components/SidebarFilter'; 
import imgGame from '../assets/images/gaming.jpg';
import imgStorage from '../assets/images/ram.jpg';
import imgCamera from '../assets/images/camera.jpg';
import HotDealsSection from '../components/HotDealsSection';
import NewsSection from '../components/NewsSection';
const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword');

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(location.search);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    navigate(`/?${newParams.toString()}`);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

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
        console.error("Lỗi fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);

  return (
    <div className="home-container container-fluid">
      {/* SECTION NHU CẦU GIỮ NGUYÊN */}
      <section className="needs-section">
        <div className="needs-container">
          <h2 className="section-title-main">CHỌN ĐIỆN THOẠI THEO NHU CẦU</h2>
          <div className="needs-grid">
            <div className="needs-card" onClick={() => updateFilter('ram', '12GB')}>
              <div className="needs-image-box"><img src={imgGame} alt="Gaming" /></div>
              <div className="needs-content"><h3>Chơi game mượt</h3><p>Chip mạnh, RAM khủng</p></div>
            </div>
            <div className="needs-card" onClick={() => updateFilter('storage', '512GB')}>
              <div className="needs-image-box"><img src={imgStorage} alt="Storage" /></div>
              <div className="needs-content"><h3>Dung lượng lớn</h3><p>Lưu trữ không giới hạn</p></div>
            </div>
            <div className="needs-card" onClick={() => updateFilter('feature', 'camera')}>
              <div className="needs-image-box"><img src={imgCamera} alt="Camera" /></div>
              <div className="needs-content"><h3>Chụp ảnh đẹp</h3><p>Camera chuẩn studio</p></div>
            </div>
          </div>
        </div>
      </section>
        
        <HotDealsSection />

      <div className="main-layout" style={{ display: 'flex', gap: '25px', marginTop: '30px' }}>
        
        {/* GỌI SIDEBAR FILTER Ở ĐÂY */}
        <SidebarFilter />

        {/* DANH SÁCH SẢN PHẨM */}
        <section className="featured-section" style={{ flexGrow: 1 }}>
          <div className="section-header">
            <h2 className="section-title-main" style={{ margin: 0 }}>
              {keyword ? `Kết quả cho: "${keyword}"` : "Tất cả sản phẩm"}
            </h2>
          </div>

          <div className="product-grid-5" style={{ marginTop: '20px' }}>
            {loading ? (
              <p className="status-text">Đang tải dữ liệu...</p>
            ) : (
              products.map((item) => (
                <Link to={`/product/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="product-card">
                    {/* Giữ nguyên toàn bộ nội dung card của Sơn */}
                    {item.sale_price > 0 && (
                      <div className="sale-badge">-{Math.round(((item.price - item.sale_price) / item.price) * 100)}%</div>
                    )}
                    <div className="product-img-wrap">
                      <img src={`${import.meta.env.VITE_API_BASE_URL}/${item.image}`} alt={item.name} />
                    </div>
                    <div className="product-detail">
                      <p className="product-brand">{item.brand}</p>
                      <h3 className="product-name">{item.name}</h3>
                      <div className="product-price">
                        <span className="price-new">{parseInt(item.sale_price || item.price).toLocaleString()}₫</span>
                      </div>
                      <button className="btn-add-cart" onClick={(e) => handleAddToCart(e, item)}>Thêm vào giỏ</button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
      <NewsSection />
    </div>
  );
};

export default Home;