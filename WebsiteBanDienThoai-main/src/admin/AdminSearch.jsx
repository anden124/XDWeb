import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function useAdminList(endpoint, token) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    const controller = new AbortController();
    axios.get(endpoint, {
      params: { keyword: keyword || undefined, page },
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: controller.signal,
    }).then(({ data }) => {
      if (controller.signal.aborted) return;
      if (page > data.data.last_page) {
        setPage(data.data.last_page);
        return;
      }
      setResult(data.data);
    }).catch(requestError => {
      if (controller.signal.aborted || axios.isCancel(requestError)) return;
      if ([401, 403].includes(requestError.response?.status)) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
        return;
      }
      setError('Không thể tải danh sách. Vui lòng thử lại.');
    });
    return () => controller.abort();
  }, [endpoint, keyword, navigate, page, revision, token]);

  function resetResult() {
    setResult(null);
    setError('');
  }

  function search(value) {
    resetResult();
    setKeyword(value);
    setPage(1);
    setRevision(previous => previous + 1);
  }

  function changePage(value) {
    resetResult();
    setPage(value);
  }

  function reload() {
    resetResult();
    setRevision(previous => previous + 1);
  }

  return { result, setResult, error, setError, page, keyword, search, changePage, reload };
}

export function AdminSearch({ label, placeholder, onSearch, disabled = false }) {
  const [input, setInput] = useState('');

  return (
    <form className="admin-list-search" role="search" onSubmit={event => {
      event.preventDefault();
      onSearch(input.trim());
    }}>
      <label>
        <span>{label}</span>
        <input type="search" value={input} placeholder={placeholder} maxLength={255} disabled={disabled}
          onChange={event => setInput(event.target.value)} />
      </label>
      <button type="submit" className="btn-add" disabled={disabled}>Tìm kiếm</button>
      <button type="button" className="admin-search-clear" disabled={disabled} onClick={() => {
        setInput('');
        onSearch('');
      }}>Xóa bộ lọc</button>
    </form>
  );
}

export function AdminListPager({ page, lastPage, onChange, disabled = false }) {
  if (!lastPage || lastPage <= 1) return null;
  return (
    <nav className="admin-order-actions" aria-label="Phân trang">
      <button type="button" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}>Trang trước</button>
      <span>{page} / {lastPage}</span>
      <button type="button" disabled={disabled || page >= lastPage} onClick={() => onChange(page + 1)}>Trang sau</button>
    </nav>
  );
}
