  import React, { useContext, useState } from "react";
  import { CartContext } from "../context/CartContext";

  const PROVINCES = [
    "Hà Nội","TP. Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ",
    "An Giang","Bà Rịa - Vũng Tàu","Bắc Giang","Bắc Kạn","Bạc Liêu",
    "Bắc Ninh","Bến Tre","Bình Định","Bình Dương","Bình Phước",
    "Bình Thuận","Cà Mau","Cao Bằng","Đắk Lắk","Đắk Nông",
    "Điện Biên","Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang",
    "Hà Nam","Hà Tĩnh","Hải Dương","Hậu Giang","Hòa Bình",
    "Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu",
    "Lâm Đồng","Lạng Sơn","Lào Cai","Long An","Nam Định",
    "Nghệ An","Ninh Bình","Ninh Thuận","Phú Thọ","Phú Yên",
    "Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị",
    "Sóc Trăng","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên",
    "Thanh Hóa","Thừa Thiên Huế","Tiền Giang","Trà Vinh","Tuyên Quang",
    "Vĩnh Long","Vĩnh Phúc","Yên Bái",
  ];

  const PAYMENT_METHODS = [
    { id: "cod",      label: "Thanh toán khi nhận hàng (COD)", icon: "💵" },
    { id: "bank",     label: "Chuyển khoản ngân hàng",         icon: "🏦" },
    { id: "momo",     label: "Ví MoMo",                        icon: "🟣" },
    { id: "zalopay",  label: "ZaloPay",                        icon: "🔵" },
  ];

  const Checkout = () => {

    const { cartItems, clearCart } = useContext(CartContext);

    const total      = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping   = total >= 2000000 ? 0 : 30000;
    const finalTotal = total + shipping;

    const [form, setForm] = useState({
      fullName: "",
      phone:    "",
      email:    "",
      province: "",
      district: "",
      ward:     "",
      address:  "",
      note:     "",
    });

    const [payment, setPayment] = useState("cod");
    const [errors,  setErrors]  = useState({});
    const [success, setSuccess] = useState(false);
    const [orderId]             = useState(`DH${Date.now().toString().slice(-6)}`);
const [finalOrderTotal, setFinalOrderTotal] = useState(0);
    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
      setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
      const errs = {};
      if (!form.fullName.trim())
        errs.fullName = "Vui lòng nhập họ tên";
      if (!form.phone.match(/^(0|\+84)\d{9,10}$/))
        errs.phone = "Số điện thoại không hợp lệ";
      if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        errs.email = "Email không hợp lệ";
      if (!form.province)
        errs.province = "Vui lòng chọn tỉnh/thành";
      if (!form.address.trim())
        errs.address = "Vui lòng nhập địa chỉ";
      return errs;
    };
const handleOrder = () => {
  const errs = validate();
  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  setFinalOrderTotal(finalTotal); // ✔️ lúc này mới hợp lệ

  clearCart();
  setSuccess(true);
};

    // ════════════════════════════════
    //   TRANG ĐẶT HÀNG THÀNH CÔNG
    // ════════════════════════════════
    if (success) {
      return (
        <div style={{
          fontFamily:  "Be Vietnam Pro",
          textAlign:   "center",
          padding:     "80px 30px",
          maxWidth:    "500px",
          margin:      "auto",
        }}>

          <div style={{ fontSize: "72px", marginBottom: "16px" }}>🎉</div>

          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
            Đặt hàng thành công!
          </h2>

          <p style={{ color: "#666", marginBottom: "24px", lineHeight: "1.7" }}>
            Cảm ơn <strong>{form.fullName}</strong>! Đơn hàng của bạn đang được xử lý.<br />
            Chúng tôi sẽ liên hệ số <strong>{form.phone}</strong> để xác nhận.
          </p>

          {/* Chi tiết đơn hàng */}
          <div style={{
            background:    "#f9f9f9",
            borderRadius:  "12px",
            padding:       "20px",
            textAlign:     "left",
            marginBottom:  "28px",
          }}>
            {[
              ["Mã đơn hàng",    `#${orderId}`],
             ["Tổng tiền", `${finalOrderTotal.toLocaleString()}đ`],
              ["Thanh toán",     PAYMENT_METHODS.find((m) => m.id === payment)?.label],
              ["Giao đến",       `${form.address}, ${form.district ? form.district + ", " : ""}${form.province}`],
              ["Thời gian giao", "2 – 5 ngày làm việc"],
            ].map(([k, v]) => (
              <div key={k} style={{
                display:        "flex",
                justifyContent: "space-between",
                alignItems:     "flex-start",
                padding:        "8px 0",
                borderBottom:   "1px solid #eee",
                fontSize:       "14px",
                gap:            "12px",
              }}>
                <span style={{ color: "#888", flexShrink: 0 }}>{k}</span>
                <strong style={{
                  color:     k === "Tổng tiền" ? "#E24B4A" : "#1a1a1a",
                  textAlign: "right",
                }}>
                  {v}
                </strong>
              </div>
            ))}
          </div>

          <a
            href="/"
            style={{
              display:        "inline-block",
              background:     "#E24B4A",
              color:          "white",
              padding:        "13px 32px",
              borderRadius:   "8px",
              textDecoration: "none",
              fontWeight:     "bold",
              fontSize:       "15px",
            }}
          >
            Về trang chủ
          </a>

        </div>
      );
    }


    // ════════════════════════════════
    //   FORM THANH TOÁN
    // ════════════════════════════════
    return (

      <div style={{
        fontFamily: "Be Vietnam Pro",
        maxWidth:   "1200px",
        margin:     "auto",
        padding:    "30px",
      }}>

        {/* HEADER */}
        <div style={{
          display:       "flex",
          alignItems:    "center",
          gap:           "10px",
          marginBottom:  "30px",
        }}>
          <span style={{ fontSize: "28px" }}>📦</span>
          <h2 style={{ margin: 0 }}>Thanh toán</h2>
        </div>


        {/* GRID 2 CỘT */}
        <div style={{
          display:              "grid",
          gridTemplateColumns:  "2fr 1fr",
          gap:                  "30px",
        }}>


          {/* ════ CỘT TRÁI ════ */}
          <div>

            {/* ── THÔNG TIN GIAO HÀNG ── */}
            <div style={{
              border:        "1px solid #eee",
              borderRadius:  "12px",
              padding:       "20px",
              marginBottom:  "20px",
            }}>

              <h4 style={{ marginTop: 0, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📍</span> Thông tin giao hàng
              </h4>

              {/* Họ tên + SĐT */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>

                <div>
                  <label style={lbl}>
                    Họ và tên <span style={{ color: "#E24B4A" }}>*</span>
                  </label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    style={{ ...inp, ...(errors.fullName ? { borderColor: "#E24B4A" } : {}) }}
                  />
                  {errors.fullName && <p style={errP}>{errors.fullName}</p>}
                </div>

                <div>
                  <label style={lbl}>
                    Số điện thoại <span style={{ color: "#E24B4A" }}>*</span>
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0901 234 567"
                    style={{ ...inp, ...(errors.phone ? { borderColor: "#E24B4A" } : {}) }}
                  />
                  {errors.phone && <p style={errP}>{errors.phone}</p>}
                </div>

              </div>

              {/* Email */}
              <div style={{ marginBottom: "15px" }}>
                <label style={lbl}>Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  style={{ ...inp, ...(errors.email ? { borderColor: "#E24B4A" } : {}) }}
                />
                {errors.email && <p style={errP}>{errors.email}</p>}
              </div>

              {/* Tỉnh / Thành phố */}
              <div style={{ marginBottom: "15px" }}>
                <label style={lbl}>
                  Tỉnh / Thành phố <span style={{ color: "#E24B4A" }}>*</span>
                </label>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  style={{ ...inp, ...(errors.province ? { borderColor: "#E24B4A" } : {}) }}
                >
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.province && <p style={errP}>{errors.province}</p>}
              </div>

              {/* Quận / Huyện + Phường / Xã */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>

                <div>
                  <label style={lbl}>Quận / Huyện</label>
                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="Quận 1, Huyện Củ Chi..."
                    style={inp}
                  />
                </div>

                <div>
                  <label style={lbl}>Phường / Xã</label>
                  <input
                    name="ward"
                    value={form.ward}
                    onChange={handleChange}
                    placeholder="Phường Bến Nghé..."
                    style={inp}
                  />
                </div>

              </div>

              {/* Địa chỉ cụ thể */}
              <div style={{ marginBottom: "15px" }}>
                <label style={lbl}>
                  Số nhà, tên đường <span style={{ color: "#E24B4A" }}>*</span>
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Nguyễn Huệ..."
                  style={{ ...inp, ...(errors.address ? { borderColor: "#E24B4A" } : {}) }}
                />
                {errors.address && <p style={errP}>{errors.address}</p>}
              </div>

              {/* Ghi chú */}
              <div>
                <label style={lbl}>Ghi chú</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  rows={3}
                  style={{ ...inp, height: "auto", padding: "10px 14px", resize: "vertical" }}
                />
              </div>

            </div>


            {/* ── PHƯƠNG THỨC THANH TOÁN ── */}
            <div style={{
              border:       "1px solid #eee",
              borderRadius: "12px",
              padding:      "20px",
            }}>

              <h4 style={{ marginTop: 0, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💳</span> Phương thức thanh toán
              </h4>

              {PAYMENT_METHODS.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        "14px",
                    padding:    "14px 16px",
                    border:     `1.5px solid ${payment === m.id ? "#E24B4A" : "#eee"}`,
                    borderRadius: "10px",
                    marginBottom: "10px",
                    cursor:     "pointer",
                    background: payment === m.id ? "#fff8f8" : "#fff",
                    transition: "0.2s",
                  }}
                >

                  {/* Radio tùy chỉnh */}
                  <div style={{
                    width:        "20px",
                    height:       "20px",
                    borderRadius: "50%",
                    border:       `2px solid ${payment === m.id ? "#E24B4A" : "#ccc"}`,
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    flexShrink:   0,
                  }}>
                    {payment === m.id && (
                      <div style={{
                        width:        "10px",
                        height:       "10px",
                        borderRadius: "50%",
                        background:   "#E24B4A",
                      }} />
                    )}
                  </div>

                  <span style={{ fontSize: "20px" }}>{m.icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>{m.label}</span>

                </div>
              ))}

              {/* Thông tin chuyển khoản */}
              {payment === "bank" && (
                <div style={{
                  background:   "#f0f7ff",
                  border:       "1px solid #bfdbfe",
                  borderRadius: "10px",
                  padding:      "16px",
                  marginTop:    "4px",
                  fontSize:     "14px",
                }}>
                  <p style={{ fontWeight: "700", color: "#1e40af", marginTop: 0, marginBottom: "12px" }}>
                    📋 Thông tin chuyển khoản
                  </p>
                  {[
                    ["Ngân hàng",     "MB bank"],
                    ["Số tài khoản",  "0847083848"],
                    ["Chủ tài khoản", "CONG TY PHONESHOP"],
                    ["Nội dung CK",   `PHONE ${form.phone || "+ SĐT của bạn"}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{
                      display:        "flex",
                      justifyContent: "space-between",
                      padding:        "7px 0",
                      borderBottom:   "1px solid #dbeafe",
                    }}>
                      <span style={{ color: "#666" }}>{k}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                  <p style={{ color: "#92400e", fontSize: "12px", marginBottom: 0, marginTop: "12px" }}>
                    ⚠️ Đơn hàng được xử lý sau khi nhận được chuyển khoản.
                  </p>
                </div>
              )}

            </div>

          </div>


          {/* ════ CỘT PHẢI: TÓM TẮT ════ */}
          <div>
            <div style={{
              border:       "1px solid #eee",
              borderRadius: "12px",
              padding:      "20px",
              position:     "sticky",
              top:          "80px",
            }}>

              <h4 style={{ marginTop: 0, marginBottom: "16px" }}>
                🧾 Đơn hàng ({cartItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
              </h4>

              {/* Danh sách sản phẩm */}
              {cartItems.map((item) => (
                <div key={item.id} style={{
                  display:       "flex",
                  alignItems:    "center",
                  gap:           "10px",
                  marginBottom:  "12px",
                  paddingBottom: "12px",
                  borderBottom:  "1px solid #f5f5f5",
                }}>

                  {/* Ảnh + badge */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/${item.image}`}
                      alt={item.name}
                      style={{
                        width:        "52px",
                        height:       "52px",
                        objectFit:    "cover",
                        borderRadius: "8px",
                        background:   "#f8f8f8",
                      }}
                      onError={(e) => (e.target.src = "https://picsum.photos/200")}
                    />
                    <span style={{
                      position:      "absolute",
                      top:           "-6px",
                      right:         "-6px",
                      background:    "#E24B4A",
                      color:         "white",
                      fontSize:      "10px",
                      fontWeight:    "700",
                      width:         "18px",
                      height:        "18px",
                      borderRadius:  "50%",
                      display:       "flex",
                      alignItems:    "center",
                      justifyContent:"center",
                      border:        "2px solid white",
                    }}>
                      {item.quantity}
                    </span>
                  </div>

                  {/* Tên sản phẩm */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize:     "13px",
                      fontWeight:   "600",
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace:   "nowrap",
                    }}>
                      {item.name}
                    </div>
                    {item.variant && (
                      <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
                        {item.variant}
                      </div>
                    )}
                  </div>

                  {/* Giá thành tiền */}
                  <div style={{ fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap" }}>
                    {(item.price * item.quantity).toLocaleString()}đ
                  </div>

                </div>
              ))}

              <hr />

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span>Tạm tính</span>
                <span>{total.toLocaleString()}đ</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span>Phí vận chuyển</span>
                <span style={{ color: shipping === 0 ? "#16a34a" : "inherit" }}>
                  {shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString()}đ`}
                </span>
              </div>

              {total < 2000000 && (
                <div style={{
                  background:   "#fffbeb",
                  color:        "#92400e",
                  borderRadius: "8px",
                  padding:      "8px 12px",
                  fontSize:     "12px",
                  marginBottom: "10px",
                }}>
                  🚚 Mua thêm <strong>{(2000000 - total).toLocaleString()}đ</strong> để freeship
                </div>
              )}

              <hr />

              <div style={{
                display:        "flex",
                justifyContent: "space-between",
                fontWeight:     "bold",
                fontSize:       "18px",
                color:          "#E24B4A",
              }}>
                <span>Tổng cộng</span>
                <span>{finalTotal.toLocaleString()}đ</span>
              </div>

              <button
                onClick={handleOrder}
                style={{
                  width:        "100%",
                  marginTop:    "20px",
                  padding:      "14px",
                  background:   "#E24B4A",
                  color:        "white",
                  border:       "none",
                  borderRadius: "8px",
                  fontWeight:   "bold",
                  cursor:       "pointer",
                  fontSize:     "15px",
                }}
              >
                Đặt hàng ngay
              </button>

              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <a
                  href="/cart"
                  style={{ textDecoration: "underline", color: "#555", fontSize: "14px" }}
                >
                  ← Quay lại giỏ hàng
                </a>
              </div>

              {/* Trust badges */}
              <div style={{
                marginTop:      "20px",
                display:        "flex",
                justifyContent: "space-around",
                fontSize:       "11px",
                color:          "#bbb",
                borderTop:      "1px solid #f5f5f5",
                paddingTop:     "16px",
              }}>
                <span>🔒 Bảo mật SSL</span>
                <span>🔄 Đổi trả 7 ngày</span>
                <span>📞 24/7</span>
              </div>

            </div>
          </div>

        </div>
      </div>

    );

  };


  // ── Shared styles ──

  const lbl = {
    display:      "block",
    fontSize:     "13px",
    fontWeight:   "600",
    color:        "#555",
    marginBottom: "6px",
  };

  const inp = {
    width:       "100%",
    height:      "42px",
    border:      "1px solid #ddd",
    borderRadius:"8px",
    padding:     "0 14px",
    fontSize:    "14px",
    color:       "#1a1a1a",
    outline:     "none",
    boxSizing:   "border-box",
    fontFamily:  "Be Vietnam Pro",
    background:  "white",
  };

  const errP = {
    margin:   "4px 0 0",
    fontSize: "12px",
    color:    "#E24B4A",
  };


  export default Checkout;
