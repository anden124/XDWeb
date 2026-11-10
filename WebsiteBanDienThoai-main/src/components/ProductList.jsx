import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../style/Product.css";

const ProductList = () => {

  const [products, setProducts] = useState([]);

  useEffect(() => {

    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.log("Lỗi tải sản phẩm:", err));

  }, []);


  // ADD CART

  const handleAddToCart = (product) => {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const index = cart.findIndex(p => p.id === product.id);

    if(index >= 0){

      cart[index].qty += 1;

    }else{

      cart.push({
        id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        image: `${import.meta.env.VITE_API_BASE_URL}/${product.image}`,
        variant: product.brand,
        qty: 1
      });

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Đã thêm vào giỏ hàng");

  };


  return (

    <div className="product-grid">

      {products.map(item => (

        <div key={item.id} className="product-item">

          <div className="product-card">

            <Link
              to={`/product/${item.id}`}
              className="product-link"
            >

              <div className="product-image-box">

                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/${item.image}`}
                  alt={item.name}
                  className="product-image"
                />

              </div>

              <p className="product-brand">
                {item.brand}
              </p>

              <h3 className="product-name">
                {item.name}
              </h3>


              {/* PRICE */}

              <div className="product-price">

                <span className="sale-price">
                  {parseInt(item.sale_price || item.price).toLocaleString()}đ
                </span>

                {item.sale_price > 0 && (

                  <span className="old-price">
                    {parseInt(item.price).toLocaleString()}đ
                  </span>

                )}

              </div>

            </Link>


            <button
              className="add-cart-btn"
              onClick={() => handleAddToCart(item)}
            >
              🛒 Thêm vào giỏ
            </button>

          </div>

        </div>

      ))}

    </div>

  );

};

export default ProductList;