import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

function jsonResponse(payload, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: async () => payload,
  };
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  global.fetch = jest.fn();
});

afterEach(() => {
  window.history.replaceState({}, '', '/');
  localStorage.clear();
});

test('opens the introduction page before authentication at the app root', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'KTX Care' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Bắt đầu sử dụng/ })).toHaveAttribute('href', '#login');
  const loginLinks = screen.getAllByRole('link', { name: 'Đăng nhập' });
  expect(loginLinks.every((link) => link.getAttribute('href') === '#login')).toBe(true);
  expect(loginLinks.some((link) => link.classList.contains('landing-header-login'))).toBe(true);
  const landingNavigation = screen.getByRole('navigation', { name: 'Điều hướng chính' });
  expect(landingNavigation).toBeInTheDocument();
  expect(within(landingNavigation).getAllByRole('link')).toHaveLength(6);
  expect(screen.getByRole('heading', { name: 'TỔNG QUAN' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'LIÊN HỆ' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Một mái nhà chung/ })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Để cuộc sống ở ký túc xá/ })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Kết nối ban quản lý/ })).toBeInTheDocument();
  expect(screen.queryByText('Hồ sơ cá nhân')).not.toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toHaveTextContent('Hệ thống quản lý ký túc xá');

  fireEvent.click(within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', { name: 'Giới thiệu' }));
  await waitFor(() => expect(window.location.hash).toBe('#gioi-thieu'));
  expect(screen.getByRole('heading', { name: /Một mái nhà chung/ })).toBeInTheDocument();
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', { name: 'Cộng đồng' }));
  await waitFor(() => expect(window.location.hash).toBe('#lien-he'));
  expect(screen.getByRole('heading', { name: 'KTX Care' })).toBeInTheDocument();
});

test('opens the standalone login screen from the introduction page', async () => {
  render(<App />);

  fireEvent.click(await screen.findByRole('link', { name: /Bắt đầu sử dụng/ }));

  expect(await screen.findByRole('heading', { name: 'Đăng nhập hệ thống' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'KTX Care - Trang giới thiệu' })).toHaveAttribute('href', '#welcome');
});

test('opens registration as a standalone authentication screen, not an app navigation page', async () => {
  window.history.replaceState({}, '', '/#register');

  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Tạo tài khoản sinh viên' })).toBeInTheDocument();
  expect(screen.queryByRole('navigation', { name: 'Điều hướng chính' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Chào mừng trở lại' })).not.toBeInTheDocument();
});

test('signs in and loads dashboard data from the API', async () => {
  window.history.replaceState({}, '', '/#login');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/login')) return jsonResponse({ access_token: 'test-token' });
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 1, username: 'manager', role: 'MANAGER' });
    if (url.endsWith('/rooms')) return jsonResponse([{ id: 'r1', currentOccupancy: 2, maxCapacity: 4 }]);
    if (url.endsWith('/student')) return jsonResponse([{ sid: 'SV001' }]);
    if (url.endsWith('/contract')) return jsonResponse([{ is_active: true }]);
    if (url.endsWith('/utility-bill')) return jsonResponse([{ bill_id: 1, is_paid: false, total_amount: 50000 }]);
    return jsonResponse([]);
  });

  render(<App />);
  fireEvent.change(await screen.findByLabelText('Tên đăng nhập'), { target: { value: 'manager' } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

  expect(await screen.findByRole('heading', { name: 'Bảng điều khiển' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Chào mừng trở lại' })).toBeInTheDocument();
  expect(document.querySelector('.welcome-banner')).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:5001/student',
    expect.objectContaining({ headers: expect.any(Headers) }),
  ));
  expect(screen.getByText('Sinh viên lưu trú').parentElement).toHaveTextContent('1');
  expect(localStorage.getItem('ktx_access_token')).toBe('test-token');
});

test('registers a student account through the backend API', async () => {
  global.fetch.mockResolvedValue(jsonResponse({
    message: 'Đăng ký thành công!',
    user: { id: 3, username: 'new.student', role: 'STUDENT' },
  }));
  window.history.replaceState({}, '', '/#register');

  render(<App />);

  fireEvent.change(await screen.findByLabelText('Tên đăng nhập'), { target: { value: 'new.student' } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'strong-pass-123' } });
  fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu'), { target: { value: 'strong-pass-123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));

  expect(await screen.findByRole('status')).toHaveTextContent('Tạo tài khoản thành công');
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/auth/register', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({ username: 'new.student', password: 'strong-pass-123' }),
  }));
  expect(localStorage.getItem('ktx_access_token')).toBeNull();
});

test('does not show a student-list page or navigation link to managers', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 2, username: 'manager', role: 'MANAGER' });
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#students');

  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Không tìm thấy trang' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Sinh viên' })).not.toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalledWith('http://localhost:5001/student', expect.anything());
});

test('shows the unread notification dot for managers and clears it when a notification is read', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  let isRead = false;
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 4, username: 'manager', role: 'MANAGER' });
    if (url.endsWith('/notifications/me')) return jsonResponse([{
      id: 'notification-1',
      title: 'Yêu cầu lưu trú mới',
      message: 'SV012 đã gửi yêu cầu đăng ký lưu trú.',
      isRead,
      createdAt: '2026-10-16T08:00:00.000Z',
    }]);
    if (url.endsWith('/notifications/me/notification-1/read')) {
      isRead = true;
      return jsonResponse({
        id: 'notification-1',
        title: 'Yêu cầu lưu trú mới',
        message: 'SV012 đã gửi yêu cầu đăng ký lưu trú.',
        isRead: true,
        createdAt: '2026-10-16T08:00:00.000Z',
      });
    }
    return jsonResponse([]);
  });

  render(<App />);

  const notificationButton = await screen.findByRole('button', { name: 'Thông báo, 1 chưa đọc' });
  expect(notificationButton.querySelector('.notification-unread-dot')).toBeInTheDocument();
  fireEvent.click(notificationButton);
  fireEvent.click(await screen.findByRole('button', { name: 'Đánh dấu đã đọc' }));

  expect(await screen.findByRole('button', { name: 'Thông báo' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Thông báo' }).querySelector('.notification-unread-dot')).not.toBeInTheDocument();
});

test('student accounts only see the student portal, room registration, personal bills, and management contact', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 7, username: 'student07', role: 'STUDENT' });
    if (url.endsWith('/student/me/portal')) return jsonResponse({
      linked: false,
      student: null,
      room: null,
      roommates: [],
      bills: [],
    });
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#overview');

  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Hồ sơ cá nhân', level: 2 })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Hồ sơ cá nhân', level: 1 })).toBeInTheDocument();
  expect(document.querySelector('.welcome-banner')).toBeInTheDocument();
  const navigation = screen.getByRole('navigation', { name: 'Điều hướng chính' });
  expect(navigation).toHaveTextContent('Hồ sơ cá nhân');
  expect(navigation).toHaveTextContent('Phòng của tôi');
  expect(navigation).toHaveTextContent('Hóa đơn của tôi');
  expect(navigation).toHaveTextContent('Liên hệ quản lý');
  expect(screen.queryByRole('link', { name: 'Tổng quan' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Tòa nhà & Phòng' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Sinh viên' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Hóa đơn của tôi' }));
  expect(await screen.findByRole('link', { name: 'Đến hồ sơ cá nhân' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Phòng của tôi' }));
  expect(await screen.findByRole('heading', { name: 'Hoàn thiện hồ sơ trước khi đăng ký lưu trú' })).toBeInTheDocument();
  expect(document.querySelector('.welcome-banner')).not.toBeInTheDocument();
  expect(screen.queryByText('Nhập mã sinh viên và email khớp với hồ sơ ban quản lý đã tạo để xem dữ liệu lưu trú cá nhân.')).not.toBeInTheDocument();
});

test('shows a student their room and a newly confirmed invoice before it is near the due date', async () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const formattedDueDate = [
    dueDate.getFullYear(),
    String(dueDate.getMonth() + 1).padStart(2, '0'),
    String(dueDate.getDate()).padStart(2, '0'),
  ].join('-');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 9, username: 'student09', role: 'STUDENT' });
    if (url.endsWith('/student/me/portal')) return jsonResponse({
      linked: true,
      student: { sid: 'SV009', name: 'Sinh viên chín', email: 'sv9@example.com', phone: '0900000009' },
      room: { id: 'room-9', roomNumber: '302', building: 'Tòa B' },
      roommates: [{ sid: 'SV010', name: 'Sinh viên mười', phone: '0900000010' }],
      bills: [{ bill_id: 22, billType: 'UTILITY', month: 10, year: 2026, roomRentAmount: 50000, total_amount: 135000, dueDate: formattedDueDate, is_paid: false }],
    });
    return jsonResponse([]);
  });
  localStorage.setItem('ktx_access_token', 'test-token');
  window.history.replaceState({}, '', '/#my-room');

  render(<App />);

  expect(await screen.findByText('302')).toBeInTheDocument();
  expect(screen.getByText('Tòa B')).toBeInTheDocument();
  expect(screen.getByText('Sinh viên mười')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '0900000010' })).toHaveAttribute('href', 'tel:0900000010');

  fireEvent.click(screen.getByRole('link', { name: 'Hóa đơn của tôi' }));
  expect(await screen.findByText('HD-0022')).toBeInTheDocument();
  expect(screen.getByText('50.000 ₫')).toBeInTheDocument();
  expect(screen.getByText('85.000 ₫')).toBeInTheDocument();
  expect(screen.getByText('135.000 ₫')).toBeInTheDocument();
  expect(screen.getByText('Sắp đến hạn')).toBeInTheDocument();
});

test('students can view a general charge and its optional receipt image', async () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: jest.fn(() => 'blob:invoice-receipt') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: jest.fn() });
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 27, username: 'student27', role: 'STUDENT' });
    if (url.endsWith('/notifications/me')) return jsonResponse([]);
    if (url.endsWith('/student/me/portal')) return jsonResponse({
      linked: true,
      student: { sid: 'SV027', name: 'Sinh viên 27', email: 'sv27@example.com', phone: '0900000027' },
      room: { id: 'room-27', building: 'A', roomNumber: '107' },
      roommates: [],
      bills: [{
        bill_id: 27,
        billType: 'GENERAL',
        title: 'Sửa điều hòa',
        description: 'Thay tụ máy lạnh',
        month: 10,
        year: 2026,
        total_amount: 50000,
        dueDate: '2099-11-10',
        is_paid: false,
        hasReceiptImage: true,
      }],
    });
    if (url.endsWith('/meter-readings/me/current')) return jsonResponse({
      room: { id: 'room-27', building: 'A', roomNumber: '107' },
      month: 10,
      year: 2026,
      deadline: '2026-10-31',
      canSubmit: false,
      submission: null,
    });
    if (url.endsWith('/utility-bill/27/receipt')) {
      return {
        ok: true,
        status: 200,
        headers: { get: () => 'image/png' },
        blob: async () => new Blob(['receipt']),
      };
    }
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#my-bills');

  const { unmount } = render(<App />);

  expect(await screen.findByText('Sửa điều hòa')).toBeInTheDocument();
  expect(screen.getByText('Thay tụ máy lạnh')).toBeInTheDocument();
  expect(await screen.findByRole('link', { name: 'Xem ảnh hóa đơn' })).toHaveAttribute('href', 'blob:invoice-receipt');
  unmount();
  if (originalCreateObjectURL) Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreateObjectURL });
  else delete URL.createObjectURL;
  if (originalRevokeObjectURL) Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevokeObjectURL });
  else delete URL.revokeObjectURL;
});

test('students manually enter meter readings and submit both photos as evidence', async () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: jest.fn(() => 'blob:meter-preview') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: jest.fn() });
  let submitted = false;
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 15, username: 'student15', role: 'STUDENT' });
    if (url.endsWith('/notifications/me')) return jsonResponse([]);
    if (url.endsWith('/student/me/portal')) return jsonResponse({
      linked: true,
      student: { sid: 'SV015', name: 'Sinh viên mười lăm', email: 'sv15@example.com', phone: '0900000015' },
      room: { id: 'room-15', building: 'A', roomNumber: '105' },
      roommates: [],
      bills: [],
    });
    if (url.endsWith('/meter-readings/me/current')) return jsonResponse({
      room: { id: 'room-15', building: 'A', roomNumber: '105' },
      month: 10,
      year: 2026,
      deadline: '2026-10-31',
      canSubmit: !submitted,
      submission: submitted ? { id: 21, status: 'PENDING' } : null,
    });
    if (url.endsWith('/meter-readings/me')) {
      submitted = true;
      return jsonResponse({ id: 21, status: 'PENDING' });
    }
    return jsonResponse([]);
  });
  localStorage.setItem('ktx_access_token', 'test-token');
  window.history.replaceState({}, '', '/#my-bills');

  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Gửi chỉ số điện nước' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Ảnh minh chứng công tơ điện'), {
    target: { files: [new File(['electric'], 'electric.jpg', { type: 'image/jpeg' })] },
  });
  fireEvent.change(screen.getByLabelText('Ảnh minh chứng công tơ nước'), {
    target: { files: [new File(['water'], 'water.jpg', { type: 'image/jpeg' })] },
  });
  expect(screen.queryByRole('button', { name: 'Đọc số từ ảnh' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('Tự nhập chỉ số điện (kWh)')).toHaveValue(null);
  expect(screen.getByLabelText('Tự nhập chỉ số nước (m³)')).toHaveValue(null);
  fireEvent.change(screen.getByLabelText('Tự nhập chỉ số nước (m³)'), { target: { value: '87' } });
  fireEvent.change(screen.getByLabelText('Tự nhập chỉ số điện (kWh)'), { target: { value: '1235' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi chỉ số cho quản lý xác nhận' }));

  expect(await screen.findByText(/đang chờ quản lý xác nhận/i)).toBeInTheDocument();
  const submissionRequest = global.fetch.mock.calls.find(([url]) => url.endsWith('/meter-readings/me'));
  expect(submissionRequest[1].body.get('electricReading')).toBe('1235');
  expect(submissionRequest[1].body.get('waterReading')).toBe('87');
  expect(submissionRequest[1].body.get('electricPhoto')).toBeInstanceOf(File);
  expect(submissionRequest[1].body.get('waterPhoto')).toBeInstanceOf(File);
  expect(global.fetch).not.toHaveBeenCalledWith(
    'http://localhost:5001/meter-readings/me/recognize',
    expect.anything(),
  );
  if (originalCreateObjectURL) Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreateObjectURL });
  else delete URL.createObjectURL;
  if (originalRevokeObjectURL) Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevokeObjectURL });
  else delete URL.revokeObjectURL;
});

test('students complete their profile and submit a residence request from their portal', async () => {
  let portal = { linked: false, student: null, room: null, roommates: [], bills: [], residenceRequest: null };
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 11, username: 'student11', role: 'STUDENT' });
    if (url.endsWith('/student/me/portal')) return jsonResponse(portal);
    if (url.endsWith('/student/me/profile')) {
      portal = {
        ...portal,
        linked: true,
        student: { sid: 'SV011', name: 'Sinh viên mười một', email: 'sv11@example.com', phone: '0900000011' },
      };
      return jsonResponse(portal);
    }
    if (url.endsWith('/student/me/residence-request')) {
      portal = { ...portal, residenceRequest: { id: 1, status: 'PENDING', requestedAt: new Date().toISOString() } };
      return jsonResponse(portal.residenceRequest);
    }
    return jsonResponse([]);
  });
  localStorage.setItem('ktx_access_token', 'test-token');
  window.history.replaceState({}, '', '/#my-profile');

  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Hoàn thiện hồ sơ cá nhân' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Mã sinh viên'), { target: { value: 'SV011' } });
  fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Sinh viên mười một' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'sv11@example.com' } });
  fireEvent.change(screen.getByLabelText('Số điện thoại'), { target: { value: '0900000011' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu hồ sơ cá nhân' }));

  expect(await screen.findByText('Sinh viên mười một')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Phòng của tôi' }));
  expect(await screen.findByRole('button', { name: 'Đăng ký lưu trú' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Đăng ký lưu trú' }));
  expect(await screen.findByRole('heading', { name: 'Yêu cầu lưu trú đang chờ quản lý duyệt' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/student/me/profile', expect.objectContaining({
    method: 'PUT',
    body: JSON.stringify({ sid: 'SV011', sname: 'Sinh viên mười một', email: 'sv11@example.com', phone: '0900000011' }),
  }));
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/student/me/residence-request', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({ note: '' }),
  }));
});

test('manager selects an available room by building, floor, and room before approving a residence request', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 4, username: 'manager', role: 'MANAGER' });
    if (url.endsWith('/residence-requests')) {
      return jsonResponse([{
        id: 12,
        status: 'PENDING',
        requestedAt: '2026-10-15T00:00:00.000Z',
        student: { sid: 'SV012', sname: 'Sinh viên mười hai', phone: '0900000012' },
      }]);
    }
    if (url.endsWith('/rooms')) return jsonResponse([
      { id: 'a-101', building: 'A', roomNumber: '101', maxCapacity: 4, currentOccupancy: 1, price: 1000000 },
      { id: 'a-203', building: 'A', roomNumber: '203', maxCapacity: 4, currentOccupancy: 2, price: 1200000 },
      { id: 'a-204', building: 'A', roomNumber: '204', maxCapacity: 4, currentOccupancy: 4, price: 1500000 },
      { id: 'b-101', building: 'B', roomNumber: '101', maxCapacity: 4, currentOccupancy: 0, price: 1100000 },
    ]);
    if (url.endsWith('/residence-requests/12/approve')) return jsonResponse({ id: 12, status: 'APPROVED' });
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#requests');

  render(<App />);

  fireEvent.click(await screen.findByRole('button', { name: 'Duyệt / xếp phòng' }));
  const buildingButton = await screen.findByRole('button', { name: /Tòa A/ });
  expect(buildingButton).toHaveTextContent('2 phòng còn chỗ');
  expect(buildingButton).toHaveTextContent('5 chỗ trống');
  expect(screen.getByRole('button', { name: /Tòa B/ })).toHaveTextContent('1 phòng còn chỗ');
  fireEvent.click(buildingButton);
  fireEvent.click(screen.getByRole('button', { name: /Tầng 2/ }));

  expect(screen.getByRole('button', { name: /Phòng 203, còn 2 chỗ/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /Phòng 204, đã đầy/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /Phòng 203, còn 2 chỗ/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Duyệt và xếp phòng' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:5001/residence-requests/12/approve',
    expect.objectContaining({
      method: 'PATCH',
      body: expect.stringContaining('"roomId":"a-203"'),
    }),
  ));
});

test('contract form uses the shared building, floor, and room picker', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 2, username: 'admin', role: 'ADMIN' });
    if (url.endsWith('/contract')) return jsonResponse([]);
    if (url.endsWith('/student')) return jsonResponse([
      { sid: 'SV020', sname: 'Sinh viên hai mươi' },
    ]);
    if (url.endsWith('/rooms')) return jsonResponse([
      { id: 'c-305', building: 'C', roomNumber: '305', maxCapacity: 4, currentOccupancy: 2, price: 1300000 },
    ]);
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#contracts');

  render(<App />);

  fireEvent.click(await screen.findByRole('button', { name: '＋ Tạo hợp đồng' }));
  fireEvent.change(await screen.findByLabelText('Sinh viên'), { target: { value: 'SV020' } });
  fireEvent.click(await screen.findByRole('button', { name: /Tòa C/ }));
  fireEvent.click(screen.getByRole('button', { name: /Tầng 3/ }));
  fireEvent.click(screen.getByRole('button', { name: /Phòng 305, còn 2 chỗ/ }));

  expect(screen.getByRole('button', { name: /Phòng 305, còn 2 chỗ/ })).toHaveAttribute('aria-pressed', 'true');
});

test('managers create a general room charge without requiring an invoice image', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url, options = {}) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 2, username: 'admin', role: 'ADMIN' });
    if (url.endsWith('/utility-bill') && options.method === 'POST') return jsonResponse({ bill_id: 26 });
    if (url.endsWith('/utility-bill')) return jsonResponse([]);
    if (url.endsWith('/rooms')) return jsonResponse([
      { id: 'b-201', building: 'B', roomNumber: '201', maxCapacity: 4, currentOccupancy: 4, price: 1200000 },
    ]);
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#invoices');

  render(<App />);

  fireEvent.click(await screen.findByRole('button', { name: '＋ Tạo hóa đơn' }));
  expect(await screen.findByRole('heading', { name: 'Tạo hóa đơn khoản thu' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Khoản cần thanh toán'), { target: { value: 'Sửa điều hòa' } });
  fireEvent.click(await screen.findByRole('button', { name: /Tòa B/ }));
  fireEvent.click(screen.getByRole('button', { name: /Tầng 2/ }));
  fireEvent.click(screen.getByRole('button', { name: /Phòng 201, đã đầy/ }));
  fireEvent.change(screen.getByLabelText('Tổng số tiền (₫)'), { target: { value: '100000' } });
  fireEvent.click(screen.getByRole('button', { name: 'Tạo hóa đơn' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:5001/utility-bill/general',
    expect.objectContaining({ method: 'POST', body: expect.any(FormData) }),
  ));
  const [, request] = global.fetch.mock.calls.find(([url, options]) => url.endsWith('/utility-bill/general') && options.method === 'POST');
  expect(request.body.get('title')).toBe('Sửa điều hòa');
  expect(request.body.get('roomId')).toBe('b-201');
  expect(request.body.get('totalAmount')).toBe('100000');
  expect(request.body.get('receiptImage')).toBeNull();
});

test('managers can contact a resident, send an overdue reminder, and track their bill share', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() - 1);
  const dueDateIso = [
    dueDate.getFullYear(),
    String(dueDate.getMonth() + 1).padStart(2, '0'),
    String(dueDate.getDate()).padStart(2, '0'),
  ].join('-');
  let isPaid = false;
  global.fetch.mockImplementation(async (url, options = {}) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 4, username: 'manager', role: 'MANAGER' });
    if (url.endsWith('/notifications/me')) return jsonResponse([]);
    if (url.endsWith('/rooms')) return jsonResponse([]);
    if (url.endsWith('/utility-bill')) return jsonResponse([{
      bill_id: 25,
      month: 9,
      year: 2026,
      total_amount: 60000,
      dueDate: dueDateIso,
      is_paid: isPaid,
      room: { building: 'A', roomNumber: '105' },
      shares: [{
        amount: 30000,
        isPaid,
        student: { sid: 'SV025', sname: 'Sinh viên 25', phone: '0900000025', email: 'sv25@example.com' },
      }],
    }]);
    if (url.endsWith('/utility-bill/25/shares/SV025/remind')) return jsonResponse({ sent: true });
    if (url.endsWith('/utility-bill/25/shares/SV025') && options.method === 'PATCH') {
      isPaid = JSON.parse(options.body).isPaid;
      return jsonResponse({});
    }
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#invoices');

  render(<App />);

  expect(await screen.findByText('Sinh viên 25')).toBeInTheDocument();
  expect(screen.getByText('Quá hạn')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Gọi' })).toHaveAttribute('href', 'tel:0900000025');
  expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:sv25@example.com');
  fireEvent.click(screen.getByRole('button', { name: 'Gửi nhắc' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:5001/utility-bill/25/shares/SV025/remind',
    expect.objectContaining({ method: 'POST' }),
  ));
  fireEvent.click(await screen.findByRole('button', { name: 'Đánh dấu đã thu' }));

  await waitFor(() => expect(document.querySelector('.bill-share-list .status-badge')).toHaveTextContent('Đã thanh toán'));
  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:5001/utility-bill/25/shares/SV025',
    expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ isPaid: true }) }),
  );
});

test('managers can inspect meter photos, correct readings, and approve the submission', async () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: jest.fn(() => 'blob:meter-review') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: jest.fn() });
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 4, username: 'manager', role: 'MANAGER' });
    if (url.endsWith('/notifications/me')) return jsonResponse([]);
    if (url.endsWith('/utility-bill')) return jsonResponse([]);
    if (url.endsWith('/rooms')) return jsonResponse([]);
    if (url.endsWith('/utility-bill/tariff')) return jsonResponse({ electricPrice: 3500, waterPrice: 20000 });
    if (url.endsWith('/meter-readings')) return jsonResponse([{
      id: 35,
      room: { building: 'A', roomNumber: '105' },
      month: 10,
      year: 2026,
      electricReading: 1234,
      waterReading: 87,
      status: 'PENDING',
      createdAt: '2026-10-31T10:00:00.000Z',
    }]);
    if (url.endsWith('/photo/electric') || url.endsWith('/photo/water')) {
      return { ok: true, status: 200, blob: async () => new Blob(['image']) };
    }
    if (url.endsWith('/meter-readings/35/review')) return jsonResponse({ id: 35, status: 'APPROVED' });
    return jsonResponse([]);
  });
  window.history.replaceState({}, '', '/#utilities');

  const { unmount } = render(<App />);

  expect(document.querySelector('.welcome-banner')).not.toBeInTheDocument();
  expect(await screen.findByText('Tòa A · 105')).toBeInTheDocument();
  expect(await screen.findByLabelText('Giá điện (đ/kWh)')).toHaveValue(3500);
  expect(screen.getByLabelText('Giá nước (đ/m³)')).toHaveValue(20000);
  fireEvent.click(screen.getByRole('button', { name: 'Xem ảnh / xác nhận' }));
  expect(await screen.findByAltText('Ảnh minh chứng công tơ điện do sinh viên gửi')).toHaveAttribute('src', 'blob:meter-review');
  expect(screen.getByAltText('Ảnh minh chứng công tơ nước do sinh viên gửi')).toHaveAttribute('src', 'blob:meter-review');
  fireEvent.change(screen.getByLabelText('Chỉ số điện (kWh)'), { target: { value: '1235' } });
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận và tạo hóa đơn' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:5001/meter-readings/35/review',
    expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ status: 'APPROVED', electricReading: 1235, waterReading: 87, reviewNote: '' }),
    }),
  ));
  unmount();
  if (originalCreateObjectURL) Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreateObjectURL });
  else delete URL.createObjectURL;
  if (originalRevokeObjectURL) Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevokeObjectURL });
  else delete URL.revokeObjectURL;
});

test('shows API failures explicitly on the dashboard', async () => {
  localStorage.setItem('ktx_access_token', 'test-token');
  global.fetch.mockImplementation(async (url) => {
    if (url.endsWith('/auth/profile')) return jsonResponse({ id: 2, username: 'admin', role: 'ADMIN' });
    return jsonResponse({ message: 'Database unavailable' }, false, 503);
  });
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Bảng điều khiển' })).toBeInTheDocument();
  expect(await screen.findByRole('status')).toHaveTextContent(/không thể tải số liệu tổng quan/i);
});
