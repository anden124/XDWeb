import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { contentFromClipboardHtml } from '../productContent';
import './Admin.css';

const initialForm = {
  name: '', brand: '', price: '', sale_price: '', image: null,
  category_id: '1', quantity: '10', color: '', ram: '', storage: '', description: '', specifications: '',
};

const contentFields = [['specifications', 'Thông số kỹ thuật'], ['description', 'Thông tin nổi bật']];

const productImageTypes = 'image/jpeg,image/png,image/gif,image/webp';

function priceValue(value) {
  return value == null || value === '' ? '' : String(Number(value));
}

function PriceInput({ value, onChange, required, placeholder = "30.000.000" }) {
  const [whole, fraction] = String(value).split('.');
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return <input type="text" inputMode="decimal" placeholder={placeholder} required={required}
    value={fraction === undefined ? formatted : formatted + ',' + fraction}
    onChange={event => {
      const entry = event.target.value.replace(/[.\s]/g, '');
      if (/^\d{1,10}(,\d{0,2})?$/.test(entry) || entry === '') {
        onChange(entry.replace(',', '.'));
      }
    }}
    onBlur={() => onChange(priceValue(value))} />;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function ProductForm({ editingId }) {
  const [form, setForm] = useState(initialForm);
  const [variants, setVariants] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }
    const controller = new AbortController();
    const config = {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: controller.signal,
    };
    Promise.all([
      axios.get(`${API_BASE}/api/admin/brands/options`, config),
      editingId ? axios.get(`${API_BASE}/api/admin/products/${editingId}`, config) : null,
    ]).then(([brandResponse, productResponse]) => {
      if (controller.signal.aborted) return;
      const options = brandResponse.data.data;
      setBrands(options);
      if (!productResponse) return;
      const item = productResponse.data.data;
      const brandName = item.brand?.trim() ?? '';
      setVariants((item.variants ?? []).map(variant => ({
        ...variant, price: priceValue(variant.price), sale_price: priceValue(variant.sale_price),
      })));
      setForm({
        ...initialForm,
        name: item.name,
        brand: options.find(brand => brand.name.toLowerCase() === brandName.toLowerCase())?.name ?? '',
        price: priceValue(item.price),
        sale_price: priceValue(item.sale_price),
        category_id: item.category_id ?? '1',
        quantity: item.quantity,
        color: item.color ?? '',
        ram: item.ram ?? '',
        description: item.description ?? '',
        specifications: item.specifications ?? '',
        storage: item.storage ?? '',
      });
    }).catch(error => {
      if (controller.signal.aborted || axios.isCancel(error)) return;
      if ([401, 403].includes(error.response?.status)) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
        return;
      }
      setLoadError(error.response?.data?.message || 'Không thể tải thông tin sản phẩm hoặc danh sách hãng.');
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [editingId, navigate, token]);

  const handleInput = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') setForm({ ...form, image: files[0] });
    else setForm({ ...form, [name]: value });
  };

  function insertContent(input, content) {
    const before = input.value.slice(0, input.selectionStart);
    const after = input.value.slice(input.selectionEnd);
    const prefix = before && !before.endsWith('\n') ? '\n' : '';
    const suffix = after && !after.startsWith('\n') ? '\n' : '';
    const value = before + prefix + content + suffix + after;
    if (value.length > input.maxLength) {
      alert('Nội dung vượt quá 5.000 ký tự. Hãy dán ít nội dung hơn.');
      return;
    }
    setForm(previous => ({ ...previous, [input.name]: value }));
  }

  function pasteContent(event) {
    const content = contentFromClipboardHtml(event.clipboardData.getData('text/html'));
    if (!content) return;
    event.preventDefault();
    insertContent(event.currentTarget, content);
  }

  function addVariant() {
    setVariants(previous => [...previous, {
      draftId: crypto.randomUUID(),
      color: previous.length ? '' : form.color,
      price: previous.length ? '' : form.price,
      sale_price: previous.length ? '' : form.sale_price,
      quantity: previous.length ? '0' : form.quantity,
      image: '',
    }]);
  }

  function changeVariant(index, field, value) {
    setVariants(previous => previous.map((variant, row) =>
      row === index ? { ...variant, [field]: value } : variant
    ));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaveError('');
    setSaving(true);
    const formData = new FormData();
    Object.keys(form).forEach(key => {
        if (key === 'image') {
            if (form.image instanceof File) formData.append('image', form.image);
        } else {
            formData.append(key, form[key] ?? '');
        }
    });
    if (variants.length) {
      formData.set('price', variants[0].price);
      formData.set('sale_price', '');
      variants.forEach(({ id, color, price, sale_price, quantity, imageFile }, index) => {
        const fields = { color, price, sale_price, quantity };
        if (id) fields.id = id;
        if (imageFile instanceof File) fields.image_file = imageFile;
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(`variants[${index}][${key}]`, value);
        });
      });
    }

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      };

      if (editingId) {
        formData.append('_method', 'PUT'); 
        await axios.post(`${API_BASE}/api/admin/products/${editingId}`, formData, config);
      } else {
        await axios.post(`${API_BASE}/api/admin/products`, formData, config);
      }
      navigate('/admin', { replace: true, state: { notice: editingId ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.' } });
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
        return;
      }
      const response = error.response?.data;
      setSaveError(Object.values(response?.errors ?? {}).flat()[0] || response?.message || 'Không thể lưu sản phẩm.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-card admin-product-editor">
      <div className="admin-product-heading">
        <div>
          <Link className="admin-product-back" to="/admin">← Quay lại danh sách</Link>
          <h1>{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
          <p>Điền thông tin chung, thông số và phiên bản màu của sản phẩm.</p>
        </div>
      </div>
      {loading && <p role="status">Đang tải sản phẩm...</p>}
      {loadError && <p className="admin-product-error" role="alert">{loadError}</p>}
      {!loading && !loadError && token && (
          <form className="admin-form" onSubmit={handleSubmit}>
            <fieldset className="admin-variants">
              <legend>Thông tin chung và giá</legend>
            <div className="form-grid">
              <label>
                <span>Tên sản phẩm</span>
                <input name="name" placeholder="Tên" onChange={handleInput} value={form.name} required />
              </label>
              <label>
                <span>Hãng</span>
                <select name="brand" onChange={handleInput} value={form.brand} required>
                  <option value="">Chọn hãng</option>
                  {brands.map(brand => <option key={brand.id} value={brand.name}>{brand.name}</option>)}
                </select>
                {!brands.length && <Link to="/admin/brands">Thêm hãng trong Quản lý hãng</Link>}
              </label>
              {!variants.length && <label>
                <span>Giá gốc</span>
                <PriceInput value={form.price} required onChange={price => setForm(previous => ({ ...previous, price }))} />
              </label>}
              {!variants.length && <label>
                <span>Giá khuyến mãi</span>
                <PriceInput placeholder="Để trống nếu không giảm" value={form.sale_price} onChange={sale_price => setForm(previous => ({ ...previous, sale_price }))} />
              </label>}
              {!variants.length && <label>
                <span>Số lượng tồn kho</span>
                <input name="quantity" type="number" min="0" placeholder="Số lượng" onChange={handleInput} value={form.quantity} required />
              </label>}
              <label>
                <span>Ảnh sản phẩm</span>
                <input name="image" type="file" onChange={handleInput} accept={productImageTypes} />
              </label>
              {!variants.length && <label>
                <span>Màu sắc</span>
                <input name="color" placeholder="Ví dụ: Đen" maxLength={255} value={form.color} onChange={handleInput} />
              </label>}
              <label>
                <span>RAM</span>
                <input name="ram" placeholder="Ví dụ: 8GB" maxLength={255} value={form.ram} onChange={handleInput} />
              </label>
              <label>
                <span>Dung lượng lưu trữ</span>
                <input name="storage" placeholder="Ví dụ: 256GB" maxLength={255} value={form.storage} onChange={handleInput} />
              </label>
            </div>
            </fieldset>
            <fieldset className="admin-variants">
              <legend>Nội dung chi tiết</legend>
              <div className="form-grid">
              {contentFields.map(([field, label]) => (
                <div className="admin-product-description" key={field}>
                  <label>
                    <span>{label}</span>
                    <textarea name={field} rows={4} maxLength={5000}
                      placeholder="Sao chép cả đoạn có chữ, bảng và ảnh rồi dán vào đây."
                      value={form[field]} onChange={handleInput} onPaste={pasteContent} />
                  </label>
                </div>
              ))}
            </div>
            </fieldset>
            <fieldset className="admin-variants">
              <legend>Phiên bản màu</legend>
              <p>Mỗi màu có giá và tồn kho riêng. Nếu chưa có ảnh màu, có thể dùng ảnh chung của sản phẩm.</p>
              {variants.map((variant, index) => (
                <div className="form-grid admin-variant-row" key={variant.id ?? variant.draftId}>
                  <label>Màu
                    <input value={variant.color} maxLength={100} placeholder="Trắng, Đen, Cam…" required
                      onChange={event => changeVariant(index, 'color', event.target.value)} />
                  </label>
                  <label>Giá gốc
                    <PriceInput value={variant.price} required onChange={value => changeVariant(index, 'price', value)} />
                  </label>
                  <label>Giá khuyến mãi
                    <PriceInput placeholder="Để trống nếu không giảm" value={variant.sale_price} onChange={value => changeVariant(index, 'sale_price', value)} />
                  </label>
                  <label>Tồn kho
                    <input type="number" value={variant.quantity} min="0" max="2147483647" required
                      onChange={event => changeVariant(index, 'quantity', event.target.value)} />
                  </label>
                  <label>Ảnh của màu này
                    {variant.image && <img
                      src={/^https?:\/\//i.test(variant.image) ? variant.image : `${API_BASE}/${variant.image}`}
                      alt={`Ảnh hiện tại của màu ${variant.color}`} width="48" height="48" />}
                    <input type="file" accept={productImageTypes}
                      onChange={event => changeVariant(index, 'imageFile', event.target.files[0])} />
                  </label>
                  {!variant.id && <button type="button" className="btn-delete"
                    onClick={() => setVariants(previous => previous.filter((_, row) => row !== index))}>Bỏ dòng</button>}
                </div>
              ))}
              <button type="button" className="btn-edit" disabled={variants.length >= 30} onClick={addVariant}>+ Thêm phiên bản màu</button>
            </fieldset>
            {saveError && <p className="admin-product-error" role="alert">{saveError}</p>}
            <div className="admin-product-row-actions">
                <button type="submit" className="admin-product-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
                <Link className="admin-product-back" to="/admin">Hủy</Link>
            </div>
          </form>
      )}
    </section>
  );
}

export default function ProductEditor() {
  const { productId } = useParams();
  return <ProductForm key={productId ?? 'new'} editingId={productId} />;
}
