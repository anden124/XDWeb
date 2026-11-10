import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const Cart = () => {

  const navigate = useNavigate(); // ✅ đúng

  const { cartItems, removeFromCart, increaseQty, decreaseQty } =
    useContext(CartContext);
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // TRẠNG THÁI GIỎ HÀNG TRỐNG
  if (cartItems.length === 0) {
    return (
      <div style={{
        textAlign:"center",
        padding:"80px",
        fontFamily:"Be Vietnam Pro"
      }}>
        <div style={{fontSize:"70px"}}>🛒</div>
        <h2>Giỏ hàng trống</h2>
        <p>Hãy thêm sản phẩm để tiếp tục mua sắm</p>
        <a href="/" style={{
          color:"#E24B4A",
          textDecoration:"underline"
        }}>
          Tiếp tục mua sắm
        </a>
      </div>
    );
  }

  return (

    <div style={{
      fontFamily:"Be Vietnam Pro",
      maxWidth:"1200px",
      margin:"auto",
      padding:"30px"
    }}>

      {/* HEADER */}
      <div style={{
        display:"flex",
        alignItems:"center",
        gap:"10px",
        marginBottom:"30px"
      }}>

        <span style={{fontSize:"28px"}}>🛍</span>

        <h2>Giỏ hàng</h2>

        <span style={{
          background:"#E24B4A",
          color:"white",
          padding:"4px 10px",
          borderRadius:"20px",
          fontSize:"14px"
        }}>
          {cartItems.length}
        </span>

      </div>


      {/* GRID */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"2fr 1fr",
        gap:"30px"
      }}>


        {/* DANH SÁCH SẢN PHẨM */}
        <div>

          {cartItems.map((item)=>(
            <div key={item.id}
            style={{
              border:"1px solid #eee",
              borderRadius:"12px",
              padding:"15px",
              marginBottom:"15px",
              display:"flex",
              alignItems:"center",
              gap:"20px",
              transition:"0.2s"
            }}
            >

              {/* HÌNH */}
 <img
  src={`${import.meta.env.VITE_API_BASE_URL}/${item.image}`}
  alt={item.name}
  style={{
    width: "80px",
    height: "80px",
    objectFit: "cover",
  }}
  onError={(e) => (e.target.src = "https://picsum.photos/200")}
/>

              {/* INFO */}
              <div style={{flex:1}}>

                <div style={{
                  fontWeight:"600",
                  marginBottom:"5px"
                }}>
                  {item.name}
                </div>

                <div style={{
                  color:"#E24B4A",
                  fontWeight:"bold"
                }}>
                  {item.price.toLocaleString()}đ
                </div>

              </div>


              {/* SỐ LƯỢNG */}
              <div style={{
                display:"flex",
                alignItems:"center",
                gap:"10px"
              }}>

                <button
                  onClick={()=>decreaseQty(item.id)}
                  style={{
                    width:"28px",
                    height:"28px",
                    border:"1px solid #ddd",
                    background:"white",
                    cursor:"pointer"
                  }}
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={()=>increaseQty(item.id)}
                  style={{
                    width:"28px",
                    height:"28px",
                    border:"1px solid #ddd",
                    background:"white",
                    cursor:"pointer"
                  }}
                >
                  +
                </button>

              </div>


              {/* XOÁ */}
              <button
                onClick={()=>removeFromCart(item.id)}
                style={{
                  background:"none",
                  border:"none",
                  color:"red",
                  cursor:"pointer",
                  fontSize:"18px"
                }}
              >
                🗑
              </button>

            </div>
          ))}

        </div>


        {/* SUMMARY */}
        <div>

          <div style={{
            border:"1px solid #eee",
            borderRadius:"12px",
            padding:"20px"
          }}>

            <h4>Tóm tắt đơn hàng</h4>

            <hr/>

            <div style={{
              display:"flex",
              justifyContent:"space-between",
              marginBottom:"10px"
            }}>
              <span>Tạm tính</span>
              <span>{total.toLocaleString()}đ</span>
            </div>

            <div style={{
              display:"flex",
              justifyContent:"space-between",
              marginBottom:"10px"
            }}>
              <span>Phí vận chuyển</span>
              <span>0đ</span>
            </div>

            <hr/>

            <div style={{
              display:"flex",
              justifyContent:"space-between",
              fontWeight:"bold",
              fontSize:"18px",
              color:"#E24B4A"
            }}>
              <span>Tổng cộng</span>
              <span>{total.toLocaleString()}đ</span>
            </div>



<button onClick={() => navigate("/checkout")} style={{ width:"100%",
              marginTop:"20px",
              padding:"14px",
              background:"#E24B4A",
              color:"white",
              border:"none",
              borderRadius:"8px",
              fontWeight:"bold",
              cursor:"pointer"}}>
  Tiến hành thanh toán
</button>
         

            <div style={{
              marginTop:"15px",
              textAlign:"center"
            }}>
              <a href="/" style={{
                textDecoration:"underline"
              }}>
                Tiếp tục mua sắm
              </a>
            </div>

          </div>

        </div>

      </div>

    </div>

  );

};

export default Cart;