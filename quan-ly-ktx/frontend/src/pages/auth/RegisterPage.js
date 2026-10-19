import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setNotice('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ username: form.username.trim(), password: form.password });
      setNotice('Tạo tài khoản thành công. Hãy đăng nhập để tiếp tục.');
      setIsRegistered(true);
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
      <h2>Tạo tài khoản sinh viên</h2>
      <p className="page-description">Thông tin tài khoản sẽ được lưu an toàn trên hệ thống.</p>
      {isRegistered ? (
        <div className="registration-success">
          <p className="form-success" role="status">{notice}</p>
          <a className="button button-primary full-button" href="#login">Đến trang đăng nhập</a>
        </div>
      ) : <form className="auth-form" onSubmit={submit}>
        <label>
          Tên đăng nhập
          <input
            autoComplete="username"
            name="username"
            value={form.username}
            onChange={updateField}
            required
            minLength={3}
            maxLength={100}
            pattern=".*\S.*"
            title="Tên đăng nhập không được để trống."
          />
        </label>
        <label>
          Mật khẩu
          <input
            autoComplete="new-password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            required
            minLength={6}
            maxLength={72}
          />
        </label>
        <label>
          Xác nhận mật khẩu
          <input
            autoComplete="new-password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={updateField}
            required
            minLength={6}
            maxLength={72}
          />
        </label>
        {notice && <p className="form-success" role="status">{notice}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary full-button" disabled={isSubmitting}>
          {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>}
      {!isRegistered && <p className="auth-policy">Tài khoản tự đăng ký được cấp vai trò sinh viên. Quyền quản lý do quản trị viên cấp.</p>}
      <p className="auth-switch-copy">Đã có tài khoản? <a href="#login">Đăng nhập</a></p>
    </section>
  );
}
