import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { readImageLine } from '../productContent';
import { CartContext } from "../context/CartContext";
import "../style/ProductDetail.css"

function ContentImage({ url }) {
    return <img className="detail-content-image" src={url} alt="Ảnh minh họa sản phẩm"
        loading="lazy" referrerPolicy="no-referrer" />;
}

function TableCellContent({ value }) {
    return value.split('\u2028').map((line, index) => {
        const url = readImageLine(line);
        return url ? <ContentImage key={index} url={url} /> : (
            <React.Fragment key={index}>{index > 0 && '\n'}{line}</React.Fragment>
        );
    });
}

function ProductContent({ description }) {
    const sections = [];
    for (const line of description.split(/\r?\n/)) {
        const image = readImageLine(line);
        if (image) {
            sections.push({ type: 'image', lines: [image] });
            continue;
        }
        const cells = line.split('\t');
        const isTableRow = cells.length === 2 && cells[0].trim() && cells[1].trim();
        const type = isTableRow ? 'table' : 'text';
        const last = sections.at(-1);
        if (!last || last.type !== type) sections.push({ type, lines: [] });
        sections.at(-1).lines.push(isTableRow ? cells : line);
    }

    return sections.map(({ type, lines }, index) => {
        if (type === 'image') {
            return <ContentImage key={index} url={lines[0]} />;
        }
        return type === 'table' ? (
        <div className="detail-spec-table-wrap" key={index}>
            <table className="detail-spec-table" aria-label="Thông số nổi bật">
                <tbody>{lines.map(([label, value], row) => (
                    <tr key={row}>
                        <th scope="row"><TableCellContent value={label} /></th>
                        <td><TableCellContent value={value} /></td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
        ) : <div className="detail-highlight-text" key={index}>{lines.join('\n')}</div>;
    });
}

const ProductDetail = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [query] = useSearchParams();
    const { addToCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVariantId, setSelectedVariantId] = useState(null);

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

    const variants = product?.variants ?? [];
    const variant = variants.find(item => item.id === (selectedVariantId ?? Number(query.get('mau'))))
        ?? variants.find(item => item.quantity > 0) ?? variants[0];
    const quantity = variant?.quantity ?? product?.quantity;
    const regularPrice = variant?.price ?? product?.price;
    const salePrice = variant ? variant.sale_price : product?.sale_price;
    const unitPrice = Number(salePrice) > 0 ? salePrice : regularPrice;
    const variantImage = variant?.image;
    const imageUrl = variantImage && /^https?:\/\//i.test(variantImage)
        ? variantImage
        : `${import.meta.env.VITE_API_BASE_URL}/${variantImage || product?.image}`;

    const handlePurchase = (buyNow) => {
        if (quantity <= 0) return;
        if (!localStorage.getItem("access_token")) {
            if (localStorage.getItem("admin_token")) {
                alert("Tài khoản admin không thể đặt hàng. Hãy đăng nhập bằng tài khoản khách hàng.");
                return;
            }
            alert("Vui lòng đăng nhập để mua hàng!");
            navigate("/login");
            return;
        }

        const cartProduct = {
          id: variant ? `${product.id}:${variant.id}` : product.id,
          productId: product.id,
          variantId: variant?.id,
          name: variant ? `${product.name} – ${variant.color}` : product.name,
          price: Number(unitPrice),
          image: product.image,
          imageUrl,
        };

        if (buyNow) {
            navigate("/checkout", { state: { buyNow: { ...cartProduct, quantity: 1 } } });
            return;
        }

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
                src={imageUrl}
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
                {Number(unitPrice).toLocaleString('vi-VN')}đ
            </h3>

            {Number(salePrice) > 0 && (

                <div className="old-price">
                    <span>
                        {Number(regularPrice).toLocaleString('vi-VN')}đ
                    </span>
                </div>
            )}

        </div>

        {variants.length > 0 && <fieldset className="detail-variants">
            <legend>Chọn màu</legend>
            <div className="detail-variant-options">
                {variants.map(option => <button type="button" key={option.id}
                    aria-pressed={variant.id === option.id}
                    onClick={() => setSelectedVariantId(option.id)}>
                    <strong>{option.color}</strong>
                    <span>{option.quantity > 0 ? `${Number(option.sale_price ?? option.price).toLocaleString('vi-VN')}đ` : 'Hết hàng'}</span>
                </button>)}
            </div>
        </fieldset>}

        {/* SPECS */}

        <div className="specs-list">

            <h5>Thông số cấu hình</h5>

            <div className="spec-item">
                <strong>Màu sắc:</strong>
                <span>{variant?.color ?? product.color}</span>
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
                    {quantity > 0 ? `Còn ${quantity} sản phẩm` : 'Hết hàng'}
                </span>
            </div>

        </div>


        {/* BUTTONS */}

        <div className="button-group">

            <div className="detail-purchase-actions">
                <button type="button" className="detail-buy-now" disabled={quantity <= 0}
                    onClick={() => handlePurchase(true)}>
                    {quantity > 0 ? "Mua ngay" : "Hết hàng"}
                </button>
                <button type="button" className="detail-add-cart" disabled={quantity <= 0}
                    onClick={() => handlePurchase(false)}>
                    Thêm vào giỏ hàng
                </button>
            </div>

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

                {[
                    ['specifications', 'Thông số kỹ thuật', product.specifications],
                    ['highlights', 'Thông tin nổi bật', product.description],
                ].map(([section, title, content]) => (
                    <section className={'description-box detail-'+section} key={section}>
                        <h2 className="detail-section-title">{title}</h2>
                        <div className="detail-section-content">
                            {content ? <ProductContent description={content} /> : <p>Đang cập nhật nội dung...</p>}
                        </div>
                    </section>
                ))}

            </div>
        </div>
    );
};

export default ProductDetail;
