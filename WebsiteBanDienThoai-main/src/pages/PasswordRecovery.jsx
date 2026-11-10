import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../style/Auth.css';

export default function PasswordRecovery({ resetting = false }) {
  const [query] = useSearchParams();
  const token = query.get('token');
  const [email, setEmail] = useState(query.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (resetting && password !== confirmation) {
      setError('Hai mật khẩu chưa khớp.');
      return;
    }

    setError('');
    setNotice('');
    setBusy(true);
    try {
      const endpoint = resetting ? 'reset-password' : 'forgot-password';
      const payload = resetting ? { email, token, password, password_confirmation: confirmation } : { email };
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}`, payload);
      setNotice(response.data.message);
      setPassword('');
      setConfirmation('');
    } catch (requestError) {
      const response = requestError.response?.data;
      setError(Object.values(response?.errors ?? {}).flat()[0] || response?.message || 'Không thể tiếp tục. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <form className="auth-form" onSubmit={submit}>
          <h1 className="logo-text">{resetting ? 'Đặt lại mật khẩu' : 'Quên mật khẩu'}</h1>
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          {error && <p className="auth-notice auth-notice-error" role="alert">{error}</p>}
          {resetting && !token && <p className="auth-notice auth-notice-error">Hãy mở liên kết đặt lại mật khẩu trong email.</p>}
          {!(resetting && (!token || notice)) && <>
            <label className="form-group">Email
              <input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required />
            </label>
            {resetting && <>
              <label className="form-group">Mật khẩu mới
                <input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={8} maxLength={72} required />
              </label>
              <label className="form-group">Nhập lại mật khẩu mới
                <input type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="new-password" minLength={8} maxLength={72} required />
              </label>
            </>}
            <button className="btn-auth-submit" type="submit" disabled={busy}>
              {busy ? 'Đang xử lý…' : resetting ? 'Đổi mật khẩu' : 'Gửi liên kết đặt lại'}
            </button>
          </>}
          <div className="auth-back-home"><Link to="/login">← Quay lại đăng nhập</Link></div>
        </form>
      </div>
    </main>
  );
}
