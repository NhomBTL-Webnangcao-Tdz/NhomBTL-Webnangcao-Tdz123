import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { userApi } from '../../api/user.api';
import DataTable from '../../components/common/DataTable';
import { useFeedback } from '../../components/common/FeedbackProvider';
import { useAuth } from '../../context/AuthContext';
import useApiResource from '../../hooks/useApiResource';

const roleLabels = { ADMIN: 'Quản trị', MANAGER: 'Cán bộ', STUDENT: 'Sinh viên' };
const emptyAccount = { username: '', password: '' };

export default function StaffAccountsPanel() {
  const { user } = useAuth();
  const { confirm } = useFeedback();
  const { data: accounts, isLoading, error, refresh } = useApiResource(userApi.list);
  const [account, setAccount] = useState(emptyAccount);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAccount((current) => ({ ...current, [name]: value }));
  };

  const createManager = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const created = await userApi.createManager({ username: account.username.trim(), password: account.password });
      setAccount(emptyAccount);
      setNotice({ variant: 'success', text: `Đã tạo tài khoản cán bộ ${created.username}.` });
      refresh();
    } catch (requestError) {
      setNotice({ variant: 'danger', text: requestError.message });
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (target, role) => {
    if (role === target.role) return;
    if (!(await confirm(`Đổi vai trò của ${target.username} thành ${roleLabels[role]}?`, 'Đổi vai trò'))) return;
    setNotice(null);
    try {
      await userApi.updateRole(target.id, role);
      setNotice({ variant: 'success', text: `Đã đổi vai trò của ${target.username}. Thay đổi có hiệu lực đầy đủ khi người đó đăng nhập lại.` });
      refresh();
    } catch (requestError) {
      setNotice({ variant: 'danger', text: requestError.message });
    }
  };

  const columns = [
    { key: 'username', label: 'Tên đăng nhập' },
    {
      key: 'role',
      label: 'Vai trò',
      render: (target) => (
        <Form.Select
          size="sm"
          aria-label={`Vai trò của ${target.username}`}
          value={target.role}
          disabled={target.username === user?.username}
          onChange={(event) => changeRole(target, event.target.value)}
        >
          {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Form.Select>
      ),
    },
    { key: 'createdAt', label: 'Ngày tạo', render: (target) => new Date(target.createdAt).toLocaleDateString('vi-VN') },
  ];

  return (
    <section className="panel staff-accounts-panel">
      <h2 className="h6 mb-3">Tài khoản cán bộ</h2>
      <Form onSubmit={createManager} className="mb-3">
        <Row className="g-2 align-items-end">
          <Col xs={12} md={5}>
            <Form.Group controlId="staff-username">
              <Form.Label className="small">Tên đăng nhập</Form.Label>
              <Form.Control size="sm" name="username" value={account.username} onChange={handleChange} minLength={3} maxLength={100} required autoComplete="off" />
            </Form.Group>
          </Col>
          <Col xs={12} md={5}>
            <Form.Group controlId="staff-password">
              <Form.Label className="small">Mật khẩu</Form.Label>
              <Form.Control size="sm" type="password" name="password" value={account.password} onChange={handleChange} minLength={6} maxLength={72} required autoComplete="new-password" />
            </Form.Group>
          </Col>
          <Col xs={12} md={2}>
            <Button type="submit" size="sm" className="w-100" disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo cán bộ'}</Button>
          </Col>
        </Row>
      </Form>
      {notice && <Alert variant={notice.variant} className="py-2 small" role="status">{notice.text}</Alert>}
      <DataTable columns={columns} rows={accounts} rowKey={(target) => target.id} isLoading={isLoading} error={error} onRetry={refresh} emptyMessage="Chưa có tài khoản." />
    </section>
  );
}
