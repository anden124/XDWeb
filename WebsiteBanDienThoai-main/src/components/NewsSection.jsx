import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const NewsSection = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/news/latest`);
        const allNews = res.data.bigNews ? [res.data.bigNews, ...res.data.smallNews] : res.data.smallNews;
        setNewsList(allNews.slice(0, 4));
      } catch (error) {
        console.error("Lỗi fetch tin tức:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400x400?text=No+Image';
    if (path.startsWith('http')) return path;
    
   
  
    const cleanPath = path.replace('storage/', '');
    return `${BASE_URL}/${cleanPath}`;
  };

  if (loading) return null;

  return (
  <section className="news-section py-5" style={{ background: '#f0f2f5' }}>
    <div className="news-container"> 
      <h2 className="fw-bold mb-4" style={{ fontSize: '28px' }}>TIN TỨC MỚI NHẤT</h2>
      
      <div className="news-row"> 
        {newsList.map((item) => (
          <div className="news-col" key={item.id}>
            <Link to={`/tin-tuc/${item.id}`} className="n-card">
              {/* Ảnh tin tức */}
              <div style={{ overflow: 'hidden' }}>
                <img 
                  src={getImageUrl(item.image)} 
                  alt={item.title}
                  className="n-card-img"
                />
              </div>
              
              {/* Nội dung tin tức */}
              <div className="n-card-body">
                <span className="text-primary small fw-bold mb-2">Tin công nghệ</span>
                <h5 className="n-card-title">{item.title}</h5>
                <p className="n-card-text">
                  {item.summary || "Cập nhật những thông tin mới nhất về thị trường di động..."}
                </p>
                <div className="mt-auto pt-3 border-top small text-muted">
                  {new Date(item.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);
}
export default NewsSection;