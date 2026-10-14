import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(form);
        setIsRegister(false);
        setNotice('Đăng ký thành công. Hãy đăng nhập để tiếp tục.');
      } else {
        await login(form);
        window.location.hash = '#overview';
      }
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-panel">
      <div className="auth-symbol">K</div>
      <p className="eyebrow">CỔNG QUẢN LÝ KÝ TÚC XÁ</p>
      <h2>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập hệ thống'}</h2>
      <p className="page-description">{isRegister ? 'Đăng ký để tạo tài khoản sinh viên.' : 'Sử dụng tài khoản được cấp để tiếp tục.'}</p>
      <form className="auth-form" onSubmit={submit}>
        <label>Tên đăng nhập<input autoComplete="username" name="username" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} required minLength={isRegister ? 3 : undefined} /></label>
        <label>Mật khẩu<input autoComplete={isRegister ? 'new-password' : 'current-password'} name="password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required minLength={isRegister ? 6 : undefined} /></label>
        {notice && <p className="form-success" role="status">{notice}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary full-button" disabled={isSubmitting}>{isSubmitting ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}</button>
      </form>
      <button className="auth-switch" onClick={() => { setIsRegister((current) => !current); setError(''); setNotice(''); }}>
        {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
      </button>
      {isRegister && <p className="form-hint">Theo backend hiện tại, tài khoản tự đăng ký có vai trò STUDENT. Quyền quản lý được cấp riêng.</p>}
    </section>
  );
}
