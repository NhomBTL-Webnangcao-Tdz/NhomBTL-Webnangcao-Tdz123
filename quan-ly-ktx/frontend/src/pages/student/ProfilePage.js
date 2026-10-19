import { useState } from 'react';
import { studentApi } from '../../api/student.api';
import { ErrorState, LoadingState } from '../../components/common/AsyncState';
import PageHeading from '../../components/common/PageHeading';
import './ProfilePage.css';

function ProfileForm({ initialValue, onSaved }) {
  const [form, setForm] = useState({
    sid: initialValue?.sid || '',
    sname: initialValue?.name || '',
    email: initialValue?.email || '',
    phone: initialValue?.phone || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      onSaved(await studentApi.saveMyProfile(form));
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu hồ sơ cá nhân.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel student-profile-form" onSubmit={submit}>
      <div>
        <h3>{initialValue ? 'Cập nhật hồ sơ cá nhân' : 'Hoàn thiện hồ sơ cá nhân'}</h3>
        <p>Nhập thông tin của bạn để đăng ký lưu trú tại ký túc xá.</p>
      </div>
      <div className="form-grid">
        <label>Mã sinh viên<input value={form.sid} onChange={(event) => setForm({ ...form, sid: event.target.value })} required maxLength={15} disabled={Boolean(initialValue)} /></label>
        <label>Họ và tên<input value={form.sname} onChange={(event) => setForm({ ...form, sname: event.target.value })} required maxLength={50} /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required maxLength={50} /></label>
        <label>Số điện thoại<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required maxLength={15} /></label>
        {error && <p className="form-error form-wide" role="alert">{error}</p>}
        <div className="form-actions form-wide">
          <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu hồ sơ cá nhân'}</button>
        </div>
      </div>
    </form>
  );
}

export default function ProfilePage({ user, portal, loading, error, retry, onSaved }) {
  return (
    <>
      <PageHeading eyebrow="CỔNG SINH VIÊN" title="Hồ sơ cá nhân" description="Quản lý thông tin cá nhân dùng cho đăng ký lưu trú." />
      {loading ? <section className="panel"><LoadingState message="Đang tải hồ sơ cá nhân..." /></section>
        : error ? <section className="panel"><ErrorState message={error} onRetry={retry} /></section>
          : portal?.linked ? (
            <>
              <section className="panel profile-panel">
                <span className="identity-avatar large">{portal.student?.name?.slice(0, 1)?.toUpperCase() || 'S'}</span>
                <dl className="detail-list">
                  <div><dt>Họ và tên</dt><dd>{portal.student?.name || '—'}</dd></div>
                  <div><dt>Mã sinh viên</dt><dd>{portal.student?.sid || '—'}</dd></div>
                  <div><dt>Email</dt><dd>{portal.student?.email || '—'}</dd></div>
                  <div><dt>Số điện thoại</dt><dd>{portal.student?.phone || '—'}</dd></div>
                  <div><dt>Tên đăng nhập</dt><dd>{user?.username || '—'}</dd></div>
                </dl>
              </section>
              <ProfileForm key={portal.student.sid} initialValue={portal.student} onSaved={onSaved} />
            </>
          ) : <ProfileForm onSaved={onSaved} />}
    </>
  );
}
