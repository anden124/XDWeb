import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{
      width: "100%",
      background: "#ffffff",
      padding: "20px 0",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1000,
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "auto",
        display: "flex",
        justifyContent: "center",
        gap: "40px"
      }}>
        <Link to="/">Trang Chủ</Link>
        <Link to="/users">Users</Link>
        <Link to="/products">Sản Phẩm</Link>
        <Link to="/contact">Liên Hệ</Link>
      </div>
    </nav>
  );
}

export default Navbar;