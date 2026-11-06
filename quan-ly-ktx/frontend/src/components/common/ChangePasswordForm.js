import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { authApi } from '../../api/auth.api';
import { useFeedback } from './FeedbackProvider';

const emptyForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

// Kiểm tra giống ChangePasswordDto ở backend để báo lỗi ngay, không cần gọi API.
function validate({ currentPassword, newPassword, confirmPassword }) {
  if (newPassword.length < 6) return 'Mật khẩu mới phải có ít nhất 6 ký tự.';
  if (newPassword === currentPassword) return 'Mật khẩu mới phải khác mật khẩu hiện tại.';
  if (newPassword !== confirmPassword) return 'Mật khẩu nhập lại không khớp.';
  return '';
}

export default function ChangePasswordForm({ onDone }) {
  const { notify } = useFeedback();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const problem = validate(form);
    setError(problem);
    if (problem) return;

    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      notify('Đã đổi mật khẩu.');
      onDone();
    } catch (requestError) {
      setError(requestError.message || 'Không thể đổi mật khẩu.');
      setSaving(false);
    }
  };

  return (
    <Form className="form-grid" onSubmit={submit}>
      <label className="form-wide">Mật khẩu hiện tại<Form.Control name="currentPassword" type="password" autoComplete="current-password" value={form.currentPassword} onChange={update} required maxLength={72} autoFocus /></label>
      <label className="form-wide">Mật khẩu mới<Form.Control name="newPassword" type="password" autoComplete="new-password" value={form.newPassword} onChange={update} required maxLength={72} /></label>
      <label className="form-wide">Nhập lại mật khẩu mới<Form.Control name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={update} required maxLength={72} /></label>
      {error && <p className="form-error form-wide" role="alert">{error}</p>}
      <div className="form-actions form-wide">
        <Button variant="outline-secondary" type="button" className="button button-secondary" onClick={onDone}>Hủy</Button>
        <Button variant="primary" type="submit" className="button button-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Đổi mật khẩu'}</Button>
      </div>
    </Form>
  );
}
