import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from "../context/CartContext";
import "../style/ProductDetail.css"

const ProductDetail = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`);
                if (res.data && res.data.status === 'success') {
                    setProduct(res.data.data);
                }
            } catch (err) {
                console.error("Lỗi API:", err);
                setError("Không thể kết nối đến máy chủ.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [id]);

    // thêm giỏ hàng
    const handleAddCart = () => {

    // CHECK LOGIN

      const user = localStorage.getItem("user");

        if(!user){

           alert("Vui lòng đăng nhập để mua hàng!");

           navigate("/login");

           return;
        }

        const cartProduct = {
          id: product.id,
          name: product.name,
          price: product.sale_price || product.price,
          image: product.image
        };

        addToCart(cartProduct);

        alert("Đã thêm vào giỏ hàng!");
    };

    if (loading) return <div className="text-center my-5"><h3>Đang tải...</h3></div>;
    if (error || !product) return <div className="text-center my-5 text-danger"><h3>Sản phẩm không tồn tại!</h3></div>;

    return (
        <div className="detail-page-wrapper">
            <div className="container detail-container py-5">

                <div className="detail-flex-wrapper">

    {/* LEFT */}

    <div className="detail-left">

        <div className="img-container">

            <img
                src={`${import.meta.env.VITE_API_BASE_URL}/${product.image}`}
                alt={product.name}
                className="img-fluid"
                onError={(e) => e.target.src = 'https://via.placeholder.com/400'}
            />

        </div>

        <h2 className="product-title">
            {product.name}
        </h2>

        <div className="brand-line">
            <span className="badge bg-primary">
                {product.brand}
            </span>

            <span className="model-text">
                Model: {product.model}
            </span>
        </div>

    </div>


    {/* RIGHT */}

    <div className="detail-right">

        <div className="price-card">

            <h3>
                {parseInt(product.sale_price || product.price).toLocaleString()}đ
            </h3>

            {product.sale_price > 0 && (

                <div className="old-price">
                    <span>
                        {parseInt(product.price).toLocaleString()}đ
                    </span>
                </div>
            )}

        </div>


        {/* SPECS */}

        <div className="specs-list">

            <h5>Thông số cấu hình</h5>

            <div className="spec-item">
                <strong>Màu sắc:</strong>
                <span>{product.color}</span>
            </div>

            <div className="spec-item">
                <strong>Dung lượng:</strong>
                <span>{product.storage}</span>
            </div>

            <div className="spec-item">
                <strong>RAM:</strong>
                <span>{product.ram}</span>
            </div>

            <div className="spec-item">
                <strong>Trạng thái:</strong>

                <span>
                    {product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                </span>
            </div>

        </div>


        {/* BUTTONS */}

        <div className="button-group">

            <button
                className="btn btn-danger btn-lg"
                onClick={handleAddCart}
            >
                🛒 THÊM VÀO GIỎ HÀNG
            </button>

            <div className="sub-buttons">

                <button className="btn btn-outline-primary">
                    💳 TRẢ GÓP 0%
                </button>

                <button className="btn btn-outline-primary">
                    🏦 TRẢ GÓP QUA THẺ
                </button>

            </div>

        </div>

    </div>

</div>

                {/* mô tả */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="description-box">

                            <h4 className="fw-bold border-bottom pb-3 mb-3">
                                Đặc điểm nổi bật
                            </h4>

                            <div style={{ lineHeight: '1.8' }}>
                                {product.description ? (
                                    <div dangerouslySetInnerHTML={{
                                        __html: product.description.replace(/\n/g, '<br/>')
                                    }} />
                                ) : (
                                    <p>Đang cập nhật nội dung chi tiết...</p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetail;