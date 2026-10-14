import { useEffect, useMemo, useState } from 'react';
import { studentApi } from '../../api/student.api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import useApiResource from '../../hooks/useApiResource';
import { setHashQuery } from '../../utils/hashRoute';

const PAGE_SIZE = 8;
const emptyStudent = { sid: '', sname: '', email: '', phone: '', role: 'STUDENT' };

function StudentForm({ initialValue, onSave, onCancel, saving, error }) {
  const [student, setStudent] = useState(initialValue || emptyStudent);
  const editing = Boolean(initialValue);
  const handleChange = (event) => setStudent((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <form className="form-grid" onSubmit={(event) => {
      event.preventDefault();
      onSave({
        sid: student.sid,
        sname: student.sname,
        email: student.email,
        phone: student.phone,
        role: student.role,
      });
    }}>
      <label>Mã sinh viên<input name="sid" value={student.sid} onChange={handleChange} required disabled={editing} maxLength="15" /></label>
      <label>Họ và tên<input name="sname" value={student.sname} onChange={handleChange} required maxLength="50" /></label>
      <label>Email<input name="email" type="email" value={student.email} onChange={handleChange} required maxLength="50" /></label>
      <label>Số điện thoại<input name="phone" value={student.phone} onChange={handleChange} required maxLength="15" /></label>
      {!editing && <label>Vai trò<select name="role" value={student.role} onChange={handleChange}><option value="STUDENT">Sinh viên</option><option value="MANAGER">Quản lý</option></select></label>}
      <p className="form-hint form-wide">API hiện tại chỉ lưu mã sinh viên, họ tên, email, số điện thoại và vai trò.</p>
      {error && <p className="form-error form-wide" role="alert">{error}</p>}
      <div className="form-actions form-wide">
        <button type="button" className="button button-secondary" onClick={onCancel}>Hủy</button>
        <button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thông tin'}</button>
      </div>
    </form>
  );
}

export default function StudentsPage({ params }) {
  const { data: students, isLoading, error, refresh } = useApiResource(studentApi.list);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState('');
  const [activeStudent, setActiveStudent] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const selectedStudentId = params.get('viewStudent');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 250);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const filteredStudents = useMemo(() => students.filter((student) => (
    [student.sname, student.sid, student.phone, student.email]
      .some((value) => String(value || '').toLowerCase().includes(debouncedSearch))
  )), [students, debouncedSearch]);
  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const visibleStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedStudent = students.find((student) => student.sid === selectedStudentId);

  useEffect(() => setPage(1), [debouncedSearch]);

  const closeForm = () => {
    setFormMode('');
    setActiveStudent(null);
    setSaveError('');
  };

  const saveStudent = async (student) => {
    setSaving(true);
    setSaveError('');
    try {
      if (formMode === 'edit') await studentApi.update(activeStudent.sid, student);
      else await studentApi.create(student);
      closeForm();
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = async (student) => {
    if (!window.confirm(`Xóa hồ sơ sinh viên ${student.sname}?`)) return;
    try {
      await studentApi.remove(student.sid);
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
      setFormMode('error');
      setActiveStudent(student);
    }
  };

  const columns = [
    {
      key: 'student',
      label: 'Sinh viên',
      render: (student) => (
        <button className="identity-cell" onClick={() => setHashQuery('viewStudent', student.sid)}>
          <span className="identity-avatar">{student.sname?.slice(0, 1) || 'S'}</span>
          <span><strong>{student.sname}</strong><small>{student.email}</small></span>
        </button>
      ),
    },
    { key: 'sid', label: 'Mã sinh viên' },
    { key: 'phone', label: 'Số điện thoại' },
    { key: 'role', label: 'Vai trò', render: (student) => <StatusBadge value={student.role} label={student.role === 'STUDENT' ? 'Sinh viên' : student.role} /> },
    {
      key: 'actions',
      label: '',
      render: (student) => (
        <div className="row-actions">
          <button className="text-button" onClick={() => setHashQuery('viewStudent', student.sid)}>Chi tiết</button>
          <button className="text-button" onClick={() => { setActiveStudent(student); setFormMode('edit'); }}>Sửa</button>
          <button className="text-button danger-text" onClick={() => deleteStudent(student)}>Xóa</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeading eyebrow="HỒ SƠ LƯU TRÚ" title="Danh sách sinh viên" description="Tìm kiếm, xem và cập nhật hồ sơ đang quản lý." action={<button className="button button-primary" onClick={() => setFormMode('create')}>＋ Thêm sinh viên</button>} />
      <section className="panel">
        <div className="table-toolbar">
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm theo tên, mã hoặc số điện thoại" aria-label="Tìm sinh viên" /></label>
          <span className="toolbar-count">{filteredStudents.length} sinh viên</span>
        </div>
        <DataTable columns={columns} rows={visibleStudents} rowKey={(student) => student.sid} isLoading={isLoading} error={error} onRetry={refresh} emptyMessage="Không tìm thấy hồ sơ sinh viên." />
        {filteredStudents.length > PAGE_SIZE && (
          <div className="pagination">
            <span>Trang {page} / {pageCount}</span>
            <div><button className="button button-secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Trước</button><button className="button button-secondary" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Sau</button></div>
          </div>
        )}
      </section>
      {formMode && formMode !== 'error' && (
        <Modal title={formMode === 'edit' ? 'Cập nhật sinh viên' : 'Thêm sinh viên'} onClose={closeForm}>
          <StudentForm initialValue={activeStudent} onSave={saveStudent} onCancel={closeForm} saving={saving} error={saveError} />
        </Modal>
      )}
      {formMode === 'error' && (
        <Modal title="Không thể xóa hồ sơ" onClose={closeForm}>
          <div className="modal-body"><p className="form-error" role="alert">{saveError}</p><div className="form-actions"><button className="button button-primary" onClick={closeForm}>Đóng</button></div></div>
        </Modal>
      )}
      {selectedStudent && (
        <Modal title="Thông tin sinh viên" onClose={() => setHashQuery('viewStudent', null)}>
          <div className="detail-card">
            <span className="identity-avatar large">{selectedStudent.sname?.slice(0, 1) || 'S'}</span>
            <h3>{selectedStudent.sname}</h3>
            <p className="detail-subtitle">{selectedStudent.sid}</p>
            <dl className="detail-list">
              <div><dt>Email</dt><dd>{selectedStudent.email}</dd></div>
              <div><dt>Số điện thoại</dt><dd>{selectedStudent.phone}</dd></div>
              <div><dt>Vai trò</dt><dd>{selectedStudent.role}</dd></div>
            </dl>
            <p className="form-hint">API hiện tại chưa có CCCD, thông tin phòng và lịch sử hợp đồng/hóa đơn của sinh viên.</p>
            <button className="button button-primary full-button" onClick={() => { setHashQuery('viewStudent', null); setActiveStudent(selectedStudent); setFormMode('edit'); }}>Chỉnh sửa hồ sơ</button>
          </div>
        </Modal>
      )}
    </>
  );
}
