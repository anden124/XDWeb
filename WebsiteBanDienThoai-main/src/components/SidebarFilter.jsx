import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SidebarFilter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const maxPriceParam = searchParams.get('max_price') || 50000000;
  const [tempPrice, setTempPrice] = useState(maxPriceParam);

  
  useEffect(() => {
    setTempPrice(maxPriceParam);
  }, [maxPriceParam]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(location.search);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // location.pathname giúp bộ lọc chạy đúng dù Sơn đang ở / hay /san-pham
    navigate(`${location.pathname}?${newParams.toString()}`);
  };

  return (
    <aside className="sidebar-filter">
      <div className="filter-container">
        <h3 className="filter-title">Bộ lọc sản phẩm</h3>

        {/* Lọc Giá */}
        <div className="filter-group price-slider-group">
          <div className="price-display">
            <span className="filter-label-title" style={{ marginBottom: 0 }}>Giá tối đa</span>
            <span className="price-value">{parseInt(tempPrice).toLocaleString()}₫</span>
          </div>
          <input 
            type="range" 
            className="range-input"
            min="1000000" 
            max="50000000" 
            step="500000"
            value={tempPrice}
            onChange={(e) => setTempPrice(e.target.value)}
            onMouseUp={() => updateFilter('max_price', tempPrice)} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginTop: '5px' }}>
            <span>1tr</span><span>50tr</span>
          </div>
        </div>

        {/* Thương hiệu */}
        <div className="filter-group">
          <span className="filter-label-title">Thương hiệu</span>
          <ul className="filter-list">
            {['iPhone', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme'].map(brand => (
              <li key={brand} className="filter-item">
                <label>
                  <input 
                    type="radio" 
                    name="brand" 
                    checked={searchParams.get('keyword') === brand}
                    onChange={() => updateFilter('keyword', brand)} 
                  />
                  {brand}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* RAM */}
        <div className="filter-group">
          <span className="filter-label-title">Bộ nhớ RAM</span>
          <ul className="filter-list">
            {['4GB', '8GB', '12GB', '16GB'].map(ram => (
              <li key={ram} className="filter-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={searchParams.get('ram') === ram}
                    onChange={(e) => updateFilter('ram', e.target.checked ? ram : null)} 
                  />
                  {ram}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Màn hình */}
        <div className="filter-group">
          <span className="filter-label-title">Màn hình</span>
          <select 
            className="filter-select" 
            value={searchParams.get('hz') || ""}
            onChange={(e) => updateFilter('hz', e.target.value)}
          >
            <option value="">Tần số quét (Hz)</option>
            <option value="60">60 Hz</option>
            <option value="90">90 Hz</option>
            <option value="120">120 Hz</option>
            <option value="144">144 Hz</option>
          </select>
        </div>

        {/* OS */}
        <div className="filter-group">
          <span className="filter-label-title">Hệ điều hành</span>
          <label className="filter-item d-block">
            <input 
              type="radio" 
              name="os" 
              checked={searchParams.get('os') === 'iOS'}
              onChange={() => updateFilter('os', 'iOS')} 
            /> iOS (Apple)
          </label>
          <label className="filter-item d-block">
            <input 
              type="radio" 
              name="os" 
              checked={searchParams.get('os') === 'Android'}
              onChange={() => updateFilter('os', 'Android')} 
            /> Android
          </label>
        </div>

        {/* Tính năng */}
        <div className="filter-group">
          <span className="filter-label-title">Tính năng đặc biệt</span>
          <label className="filter-item d-block">
            <input 
              type="checkbox" 
              checked={searchParams.get('feature') === 'fast'}
              onChange={(e) => updateFilter('feature', e.target.checked ? 'fast' : null)} 
            /> Sạc siêu nhanh
          </label>
          <label className="filter-item d-block">
            <input 
              type="checkbox" 
              checked={searchParams.get('feature') === 'wireless'}
              onChange={(e) => updateFilter('feature', e.target.checked ? 'wireless' : null)} 
            /> Sạc không dây
          </label>
        </div>

        <button 
          className="btn-reset-filter" 
          onClick={() => navigate(location.pathname)}
        >
          Xóa tất cả lọc
        </button>
      </div>
    </aside>
  );
};

export default SidebarFilter;