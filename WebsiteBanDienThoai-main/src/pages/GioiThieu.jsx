import React from 'react';
import '../App.css';

const About = () => {
  return (
    <div className="about-page-wrapper">
      <div className="about-content-area">
        
        {/* Tiêu đề tự do, phóng khoáng */}
        <div className="about-header">
          <h1 className="display-1">PHONESTORE</h1>
          <p className="text-muted fw-bold">SINCE 2024 • HO CHI MINH CITY</p>
        </div>

        <div className="about-flex-row">
          {/* Nội dung bên trái */}
          <div className="about-text-side">
            <h2 className="about-main-title">Định nghĩa lại trải nghiệm công nghệ.</h2>
            <p className="about-description">
              Tại <strong>PHONESTORE</strong>, chúng tôi tin rằng công nghệ đỉnh cao không nhất thiết phải đi kèm với mức giá xa xỉ.
            </p>
            <p className="text-muted">
              Sứ mệnh của chúng tôi là mang đến những sản phẩm chính hãng, minh bạch về nguồn gốc và tận tâm trong dịch vụ bảo hành.
            </p>

            <div className="about-features">
              <div className="feature-card-minimal">
                <h5 className="fw-bold text-dark">CHÍNH HÃNG</h5>
                <p className="small mb-0 text-muted">Cam kết máy mới 100%, bảo hành tiêu chuẩn nhà sản xuất.</p>
              </div>
              <div className="feature-card-minimal">
                <h5 className="fw-bold text-dark">TẬN TÂM</h5>
                <p className="small mb-0 text-muted">Hỗ trợ kỹ thuật trọn đời, lỗi là đổi mới ngay lập tức.</p>
              </div>
            </div>
          </div>

          {/* Ảnh bên phải */}
          <div className="about-image-side">
            <img 
              src="https://img.freepik.com/free-vector/mobile-shopping-concept-illustration_114360-1084.jpg" 
              alt="PhoneStore Studio" 
            />
          </div>
        </div>

        {/* Footer info dãn rộng */}
        <div className="row mt-5 pt-5 text-center g-5">
            <div className="col-md-4">
                <h1 className="mb-3">🚀</h1>
                <h4 className="fw-bold">2 GIỜ</h4>
                <p className="text-muted small">Thời gian giao hàng trung bình tại TP.HCM.</p>
            </div>
            <div className="col-md-4">
                <h1 className="mb-3">🛡️</h1>
                <h4 className="fw-bold">12 THÁNG</h4>
                <p className="text-muted small">Bảo hành vàng cho mọi lỗi từ nhà sản xuất.</p>
            </div>
            <div className="col-md-4">
                <h1 className="mb-3">🌟</h1>
                <h4 className="fw-bold">100%</h4>
                <p className="text-muted small">Khách hàng hài lòng với chất lượng phục vụ.</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default About;