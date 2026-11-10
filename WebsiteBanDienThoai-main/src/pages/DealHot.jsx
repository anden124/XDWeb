import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import HotDealsSection from '../components/HotDealsSection';
const DealHotPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        // Gọi API lấy toàn bộ sản phẩm đang sale
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/search?has_sale=true`);
        setProducts(res.data?.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);


  return (
    <div className="container py-5">
        <HotDealsSection />
      <div className="deal-banner" style={{ background: '#d0021b', color: '#fff', padding: '40px', borderRadius: '15px', marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontWeight: 'bold' }}>🔥 TỔNG HỢP DEAL GIẢM SỐC 🔥</h1>
        <p>Cam kết giá rẻ nhất hệ thống - Chỉ áp dụng khi mua online</p>
      </div>
     
      <div className="product-grid-5">
        {products.map(item => (
            <Link to={`/product/${item.id}`} key={item.id} className="product-card-link">
               {/* Dùng lại cấu trúc product-card giống Home */}
            </Link>
        ))}
      </div>
    </div>
    
  );
};

export default DealHotPage;