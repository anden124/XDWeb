import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const HotDealsSection = ({ limit = 5 } = {}) => {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const fetchHotDeals = async () => {
      try {
        // Gọi API lấy sản phẩm đang giảm giá
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/search?has_sale=true`);
        const sortedDeals = (res.data?.data || [])
          .filter(({ price, sale_price }) => Number(sale_price) > 0 && Number(sale_price) < Number(price))
          .sort((a, b) => ((b.price - b.sale_price)/b.price) - ((a.price - a.sale_price)/a.price));
        setDeals(sortedDeals);
      } catch (error) {
        console.error("Lỗi lấy Deal Hot:", error);
      }
    };
    fetchHotDeals();
  }, []);

  if (deals.length === 0) return null;
  const visibleDeals = limit === null ? deals : deals.slice(0, limit);

  return (
    <section className="hot-deals-section" style={{ marginTop: '40px', padding: '20px', background: '#fff2f2', borderRadius: '15px', border: '2px solid #ff4d4d' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#d0021b', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>🔥 DEAL HOT TRONG NGÀY</h2>
        <div className="countdown-timer" style={{ marginLeft: '20px', background: '#ff4d4d', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontSize: '14px' }}>
            Kết thúc sau: 12:00:00
        </div>
      </div>

      <div className="product-grid-5">
        {visibleDeals.map(item => (
          <Link to={`/product/${item.id}${item.deal_variant_id ? `?mau=${item.deal_variant_id}` : ''}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="product-card hot-border" style={{ position: 'relative' }}>
              <div className="sale-badge" style={{ background: 'linear-gradient(45deg, #ff0000, #ff9900)' }}>
                GIẢM SỐC
              </div>
              <div className="product-img-wrap">
                <img src={/^https?:\/\//i.test(item.image) ? item.image : `${import.meta.env.VITE_API_BASE_URL}/${item.image}`} alt={item.name} />
              </div>
              <div className="product-detail">
                <h3 className="product-name">{item.name}</h3>
                <div className="product-price">
                  <span className="price-new">{Number(item.sale_price).toLocaleString('vi-VN')}₫</span>
                  <span className="price-old">{Number(item.price).toLocaleString('vi-VN')}₫</span>
                </div>
                {/* Thanh tiến độ ảo cho Deal Hot */}
                <div className="deal-progress" style={{ height: '8px', background: '#eee', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #ff4d4d, #ff9900)' }}></div>
                </div>
                <p style={{ fontSize: '11px', color: '#777', marginTop: '5px' }}>Đã bán 25/30 suất</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {limit !== null && deals.length > limit && (
        <Link to="/deal-hot" style={{ display: 'inline-block', marginTop: 16, color: '#a8172b', fontWeight: 700 }}>
          Xem tất cả khuyến mãi ({deals.length}) →
        </Link>
      )}
    </section>
  );
};

export default HotDealsSection;
