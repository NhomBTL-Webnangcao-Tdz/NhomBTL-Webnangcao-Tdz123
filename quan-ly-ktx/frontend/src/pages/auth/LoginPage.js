import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login, sessionError } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(form);
      window.location.hash = user.role === 'STUDENT' ? '#my-overview' : '#overview';
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
      {sessionError && !error && <p className="form-error" role="alert">{sessionError}</p>}
      <Form className="auth-form" onSubmit={submit}>
        <label>Tên đăng nhập<Form.Control autoComplete="username" name="username" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} required maxLength={100} /></label>
        <label>Mật khẩu<Form.Control autoComplete="current-password" name="password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required maxLength={72} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Button variant="primary" type="submit" className="button button-primary full-button" disabled={isSubmitting}>{isSubmitting ? 'Đang xác thực...' : 'Đăng nhập'}</Button>
      </Form>
      <p className="auth-switch-copy">Chưa có tài khoản? <a href="#register">Đăng ký</a></p>
    </section>
  );
}
