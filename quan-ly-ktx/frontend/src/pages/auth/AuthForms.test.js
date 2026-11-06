import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '../../context/AuthContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  window.location.hash = '';
});

describe('LoginPage', () => {
  const submitLogin = () => {
    type('Tên đăng nhập', 'test-sv');
    type('Mật khẩu', 'test-mat-khau');
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
  };

  test.each([
    ['STUDENT', '#my-overview'],
    ['MANAGER', '#overview'],
    ['ADMIN', '#overview'],
  ])('đăng nhập %s thì chuyển tới %s', async (role, hash) => {
    const login = jest.fn().mockResolvedValue({ role });
    useAuth.mockReturnValue({ login, sessionError: '' });
    render(<LoginPage />);

    submitLogin();

    await waitFor(() => expect(window.location.hash).toBe(hash));
    expect(login).toHaveBeenCalledWith({ username: 'test-sv', password: 'test-mat-khau' });
  });

  test('sai mật khẩu thì hiện thông báo, ở lại trang, bấm lại được', async () => {
    useAuth.mockReturnValue({ login: jest.fn().mockRejectedValue(new Error('Username hoặc mật khẩu không đúng.')), sessionError: '' });
    render(<LoginPage />);

    submitLogin();

    expect(await screen.findByRole('alert')).toHaveTextContent('Username hoặc mật khẩu không đúng.');
    expect(window.location.hash).toBe('');
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeEnabled();
  });

  test('đang gửi thì khóa nút để không gửi hai lần', async () => {
    let finish;
    const login = jest.fn(() => new Promise((resolve) => { finish = resolve; }));
    useAuth.mockReturnValue({ login, sessionError: '' });
    render(<LoginPage />);

    submitLogin();

    expect(screen.getByRole('button', { name: 'Đang xác thực...' })).toBeDisabled();
    finish({ role: 'STUDENT' });
    await waitFor(() => expect(window.location.hash).toBe('#my-overview'));
  });

  test('hiện thông báo hết phiên, lỗi mới của form được ưu tiên', async () => {
    useAuth.mockReturnValue({ login: jest.fn().mockRejectedValue(new Error('Sai mật khẩu.')), sessionError: 'Phiên đăng nhập đã hết hạn.' });
    render(<LoginPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Phiên đăng nhập đã hết hạn.');

    submitLogin();

    expect(await screen.findByText('Sai mật khẩu.')).toBeInTheDocument();
    expect(screen.queryByText('Phiên đăng nhập đã hết hạn.')).not.toBeInTheDocument();
  });

  test('thông báo lỗi chứa HTML hiện dạng chữ', async () => {
    const payload = '<img src=x onerror=alert(1)>';
    useAuth.mockReturnValue({ login: jest.fn().mockRejectedValue(new Error(payload)), sessionError: '' });
    const { container } = render(<LoginPage />);

    submitLogin();

    expect(await screen.findByText(payload)).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });
});

describe('RegisterPage', () => {
  const fillForm = (password = 'test-mat-khau', confirm = password) => {
    type('Tên đăng nhập', '  test-sv-moi  ');
    type('Mật khẩu', password);
    type('Xác nhận mật khẩu', confirm);
    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));
  };

  test('đăng ký thành công thì bỏ khoảng trắng ở tên, không gửi trường xác nhận, hiện link đăng nhập', async () => {
    const register = jest.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ register });
    render(<RegisterPage />);

    fillForm();

    expect(await screen.findByRole('status')).toHaveTextContent('Tạo tài khoản thành công.');
    expect(register).toHaveBeenCalledWith({ username: 'test-sv-moi', password: 'test-mat-khau' });
    expect(screen.getByRole('link', { name: 'Đến trang đăng nhập' })).toHaveAttribute('href', '#login');
  });

  test('mật khẩu xác nhận không khớp thì không gọi API', () => {
    const register = jest.fn();
    useAuth.mockReturnValue({ register });
    render(<RegisterPage />);

    fillForm('test-mat-khau', 'khac-hoan-toan');

    expect(screen.getByRole('alert')).toHaveTextContent('Mật khẩu xác nhận không khớp.');
    expect(register).not.toHaveBeenCalled();
  });

  test('tên đã tồn tại thì hiện lỗi của backend, sửa ô nhập thì lỗi biến mất', async () => {
    useAuth.mockReturnValue({ register: jest.fn().mockRejectedValue(new Error('Username đã được sử dụng.')) });
    render(<RegisterPage />);

    fillForm();

    expect(await screen.findByRole('alert')).toHaveTextContent('Username đã được sử dụng.');
    type('Tên đăng nhập', 'test-sv-khac');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('form có ràng buộc giống DTO backend', () => {
    useAuth.mockReturnValue({ register: jest.fn() });
    render(<RegisterPage />);

    expect(screen.getByLabelText('Tên đăng nhập')).toHaveAttribute('minlength', '3');
    expect(screen.getByLabelText('Mật khẩu')).toHaveAttribute('minlength', '6');
    expect(screen.getByLabelText('Mật khẩu')).toHaveAttribute('maxlength', '72');
  });
});
