import HotDealsSection from '../components/HotDealsSection';

export default function DealHotPage() {
  return (
    <div className="container py-5">
      <div className="deal-banner" style={{ background: '#d0021b', color: '#fff', padding: '40px', borderRadius: '15px', marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontWeight: 'bold' }}>🔥 TỔNG HỢP DEAL GIẢM SỐC 🔥</h1>
        <p>Khám phá các sản phẩm đang được giảm giá</p>
      </div>
      <HotDealsSection limit={null} />
    </div>
  );
}
