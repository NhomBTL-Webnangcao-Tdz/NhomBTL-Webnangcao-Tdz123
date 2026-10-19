import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(form);
      window.location.hash = user.role === 'STUDENT' ? '#my-profile' : '#overview';
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
      <h2>Đăng nhập hệ thống</h2>
      <p className="page-description">Sử dụng tài khoản của bạn để tiếp tục.</p>
      <form className="auth-form" onSubmit={submit}>
        <label>Tên đăng nhập<input autoComplete="username" name="username" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} required maxLength={100} /></label>
        <label>Mật khẩu<input autoComplete="current-password" name="password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required maxLength={72} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary full-button" disabled={isSubmitting}>{isSubmitting ? 'Đang xác thực...' : 'Đăng nhập'}</button>
      </form>
      <p className="auth-switch-copy">Chưa có tài khoản? <a href="#register">Đăng ký</a></p>
    </section>
  );
}
