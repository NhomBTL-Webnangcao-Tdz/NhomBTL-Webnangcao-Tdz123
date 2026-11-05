import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

const ALL = 'ADMIN, MANAGER, STUDENT';
const STAFF = 'ADMIN, MANAGER';
const ADMIN = 'ADMIN';
const STUDENT = 'STUDENT';
const LOGGED_IN = 'Mọi tài khoản đã đăng nhập';
const PUBLIC = 'Công khai';

interface EndpointDoc {
  summary: string;
  roles: string;
  conflict?: string;
  request?: unknown;
  response?: unknown;
}

const contractExample = {
  student: { sid: 'DEMO01' },
  room: { id: '<id phòng>' },
  start_date: '2026-09-01',
  end_date: '2027-06-30',
  deposit_amount: 1000000,
  is_active: true,
};
const billExample = {
  room: { id: '<id phòng>' },
  dueDate: '2026-12-10',
  month: 11,
  year: 2026,
  old_electric_index: 100,
  new_electric_index: 150,
  old_water_index: 10,
  new_water_index: 12,
  total_amount: 1400000,
  is_paid: false,
};
const studentExample = { sid: 'DEMO07', sname: 'Sinh viên Demo 7', email: 'demo07@example.test', phone: '0900000007' };
const roomExample = { roomNumber: 'A301', building: 'Tòa A', maxCapacity: 4, price: 1200000 };

// Quyền ghi ở đây phải khớp @Roles trong controller. Route mới chưa có mô tả sẽ được cảnh báo khi khởi động.
const endpoints: Record<string, EndpointDoc> = {
  'GET /': { summary: 'Kiểm tra backend đang chạy', roles: PUBLIC },

  'POST /auth/register': {
    summary: 'Đăng ký tài khoản sinh viên',
    roles: PUBLIC,
    conflict: 'Tên đăng nhập đã tồn tại',
    request: { username: 'sinhvien01', password: 'mat-khau-6-ky-tu' },
  },
  'POST /auth/login': {
    summary: 'Đăng nhập, nhận JWT có hạn 1 giờ',
    roles: PUBLIC,
    request: { username: 'demo_admin', password: '<mật khẩu>' },
    response: { message: 'Đăng nhập thành công!', access_token: '<JWT>' },
  },
  'GET /auth/profile': { summary: 'Xem tài khoản đang đăng nhập', roles: LOGGED_IN },

  'GET /users': { summary: 'Danh sách tài khoản', roles: ADMIN },
  'POST /users': {
    summary: 'Tạo tài khoản cán bộ (MANAGER)',
    roles: ADMIN,
    conflict: 'Tên đăng nhập đã tồn tại',
    request: { username: 'canbo01', password: 'mat-khau-6-ky-tu' },
  },
  'PATCH /users/{id}/role': {
    summary: 'Đổi vai trò tài khoản',
    roles: ADMIN,
    conflict: 'Tự đổi vai trò của mình hoặc hạ ADMIN cuối cùng',
    request: { role: 'MANAGER' },
  },

  'GET /rooms': { summary: 'Danh sách phòng. Có page thì trả { items, total, page, limit }, không có thì trả mảng', roles: STAFF },
  'POST /rooms': { summary: 'Tạo phòng', roles: STAFF, request: roomExample },
  'GET /rooms/{id}': { summary: 'Chi tiết phòng', roles: STAFF },
  'PATCH /rooms/{id}': { summary: 'Sửa phòng', roles: STAFF, request: { price: 1300000 } },
  'DELETE /rooms/{id}': { summary: 'Xóa phòng', roles: STAFF, conflict: 'Phòng còn hợp đồng hoặc hóa đơn' },

  'GET /rooms/{id}/residents': { summary: 'Sinh viên đang ở trong phòng', roles: STAFF },
  'PATCH /rooms/prices': { summary: 'Chỉnh giá nhiều phòng', roles: STAFF },

  'GET /student': { summary: 'Danh sách sinh viên. Có page thì trả { items, total, page, limit }, không có thì trả mảng', roles: STAFF },
  'POST /student': { summary: 'Tạo hồ sơ sinh viên', roles: STAFF, conflict: 'Mã sinh viên đã tồn tại', request: studentExample },
  'GET /student/{id}': { summary: 'Chi tiết sinh viên', roles: STAFF },
  'PUT /student/{id}': { summary: 'Sửa sinh viên, không đổi được mã', roles: STAFF, request: { phone: '0911111111' } },
  'DELETE /student/{id}': { summary: 'Xóa sinh viên', roles: ADMIN, conflict: 'Sinh viên còn hợp đồng hoặc hóa đơn' },
  'GET /student/me/portal': { summary: 'Dữ liệu cổng sinh viên: phòng, bạn cùng phòng, hóa đơn, đơn đăng ký', roles: STUDENT },
  'PUT /student/me/profile': { summary: 'Lưu hồ sơ của mình, liên kết với tài khoản', roles: STUDENT, conflict: 'Mã sinh viên đã liên kết tài khoản khác', request: studentExample },
  'POST /student/me/residence-request': { summary: 'Gửi đơn đăng ký ở', roles: STUDENT, conflict: 'Đã có đơn đang chờ duyệt hoặc đang có hợp đồng' },

  'GET /residence-requests': { summary: 'Danh sách đơn đăng ký ở', roles: STAFF },
  'PATCH /residence-requests/{id}/approve': {
    summary: 'Duyệt đơn, xếp phòng, tạo hợp đồng',
    roles: STAFF,
    conflict: 'Đơn đã xử lý hoặc phòng đã đủ chỗ',
    request: { roomId: '<id phòng>', endDate: '2027-06-30', depositAmount: 1000000 },
  },
  'PATCH /residence-requests/{id}/reject': {
    summary: 'Từ chối đơn',
    roles: STAFF,
    conflict: 'Đơn đã xử lý',
    request: { reviewNote: 'Hết chỗ ở tòa đã chọn' },
  },

  'GET /contract': { summary: 'Danh sách hợp đồng', roles: STAFF },
  'POST /contract': { summary: 'Tạo hợp đồng', roles: STAFF, request: contractExample },
  'GET /contract/{id}': { summary: 'Chi tiết hợp đồng', roles: STAFF },
  'PUT /contract/{id}': { summary: 'Sửa, gia hạn hoặc thanh lý hợp đồng', roles: STAFF, request: { is_active: false } },
  'DELETE /contract/{id}': { summary: 'Xóa hợp đồng', roles: ADMIN },

  'PATCH /contract/{id}/end': { summary: 'Kết thúc hợp đồng, giảm sĩ số phòng', roles: STAFF, conflict: 'Hợp đồng đã kết thúc' },
  'PATCH /contract/{id}/renew': {
    summary: 'Gia hạn hợp đồng',
    roles: STAFF,
    conflict: 'Hợp đồng đã kết thúc, trùng hợp đồng khác hoặc phòng hết chỗ',
    request: { end_date: '2027-12-31' },
  },
  'PATCH /contract/{id}/liquidate': { summary: 'Thanh lý hợp đồng trước hạn', roles: STAFF, conflict: 'Hợp đồng đã kết thúc' },

  'GET /payments': { summary: 'Danh sách thanh toán, lọc theo hợp đồng', roles: STAFF },
  'POST /payments': {
    summary: 'Ghi nhận thanh toán',
    roles: STAFF,
    request: { amount: 500000, payment_date: '2026-11-05', payment_type: 'Tiền cọc', contractId: 1 },
  },
  'GET /payments/{id}': { summary: 'Chi tiết thanh toán', roles: STAFF },
  'PATCH /payments/{id}': { summary: 'Sửa thanh toán', roles: STAFF, request: { amount: 600000 } },
  'DELETE /payments/{id}': { summary: 'Xóa thanh toán', roles: ADMIN },

  'GET /reports/summary': { summary: 'Báo cáo tổng hợp theo tháng: lấp đầy, đã thu, công nợ, hợp đồng sắp hết hạn', roles: STAFF },

  'GET /utility-bill': { summary: 'Danh sách hóa đơn. Có page thì trả { items, total, page, limit }, không có thì trả mảng', roles: STAFF },
  'POST /utility-bill': { summary: 'Tạo hóa đơn điện nước', roles: STAFF, request: billExample },
  'POST /utility-bill/general': { summary: 'Tạo khoản thu chung, gửi multipart/form-data, ảnh ở trường receiptImage', roles: STAFF, conflict: 'Phòng chưa có sinh viên đang ở' },
  'GET /utility-bill/{id}': { summary: 'Chi tiết hóa đơn', roles: STAFF },
  'GET /utility-bill/{id}/receipt': { summary: 'Tải ảnh biên lai; sinh viên chỉ xem được hóa đơn của mình', roles: ALL },
  'PUT /utility-bill/{id}': { summary: 'Sửa hóa đơn', roles: STAFF, request: { is_paid: true } },
  'DELETE /utility-bill/{id}': { summary: 'Xóa hóa đơn', roles: ADMIN },
  'PATCH /utility-bill/{id}/shares/{sid}': { summary: 'Đánh dấu phần của một sinh viên đã đóng', roles: STAFF, request: { isPaid: true } },
  'POST /utility-bill/{id}/shares/{sid}/remind': { summary: 'Nhắc sinh viên đóng tiền', roles: STAFF },
  'GET /utility-bill/tariff': { summary: 'Xem đơn giá điện nước', roles: STAFF },
  'PUT /utility-bill/tariff': { summary: 'Sửa đơn giá điện nước', roles: STAFF, request: { electricPrice: 3500, waterPrice: 15000 } },

  'GET /meter-readings': { summary: 'Danh sách chỉ số sinh viên gửi', roles: STAFF },
  'GET /meter-readings/me/current': { summary: 'Chỉ số kỳ hiện tại của phòng mình', roles: STUDENT },
  'POST /meter-readings/me': { summary: 'Gửi chỉ số kèm ảnh đồng hồ, gửi multipart/form-data', roles: STUDENT, conflict: 'Sinh viên cùng phòng đã gửi chỉ số kỳ này' },
  'GET /meter-readings/{id}/photo/{meter}': { summary: 'Tải ảnh đồng hồ, meter là electric hoặc water', roles: ALL },
  'PATCH /meter-readings/{id}/review': { summary: 'Duyệt chỉ số và tạo hóa đơn, hoặc yêu cầu gửi lại', roles: STAFF, conflict: 'Đã xử lý, phòng đã có hóa đơn kỳ đó, hoặc chưa cấu hình giá' },

  'GET /notifications/me': { summary: 'Thông báo của mình', roles: ALL },
  'PATCH /notifications/me/{id}/read': { summary: 'Đánh dấu đã đọc', roles: ALL },
};

const errorExample = {
  statusCode: 404,
  error: 'Not Found',
  message: 'Không tìm thấy dữ liệu.',
  path: '/student/DEMO99',
  timestamp: '2026-11-04T10:00:00.000Z',
};

function errorResponse(description: string) {
  return { description, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } };
}

/** Gắn nhóm, quyền, ví dụ và mã lỗi vào từng endpoint. Trả về danh sách route chưa có mô tả. */
export function applyEndpointDocs(document: OpenAPIObject): string[] {
  document.components ??= {};
  document.components.schemas ??= {};
  document.components.schemas.ApiError = {
    type: 'object',
    description: 'Mọi lỗi đều có dạng này. message là chuỗi, hoặc mảng khi sai dữ liệu đầu vào.',
    example: errorExample,
    properties: {
      statusCode: { type: 'integer' },
      error: { type: 'string' },
      message: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
      path: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
    },
  };

  const undocumented: string[] = [];
  for (const [path, item] of Object.entries(document.paths)) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
      const operation = item[method];
      if (!operation) continue;
      const key = `${method.toUpperCase()} ${path}`;
      const doc = endpoints[key];
      if (!doc) undocumented.push(key);

      operation.tags = [path.split('/')[1] || 'app'];
      operation.summary = doc?.summary ?? key;
      operation.description = `Quyền: ${doc?.roles ?? 'chưa ghi'}`;
      if (doc?.request && operation.requestBody && 'content' in operation.requestBody) {
        const json = operation.requestBody.content['application/json'];
        if (json) json.example = doc.request;
      }
      if (doc?.response) {
        const success = Object.keys(operation.responses).find((code) => code.startsWith('2'));
        if (success) operation.responses[success] = {
          description: 'Thành công',
          content: { 'application/json': { example: doc.response } },
        };
      }

      const isPublic = doc?.roles === PUBLIC;
      operation.security = isPublic ? [] : [{ bearer: [] }];
      const hasInput = Boolean(operation.requestBody) || path.includes('{');
      if (hasInput) operation.responses['400'] = errorResponse('Sai dữ liệu đầu vào');
      if (!isPublic) {
        operation.responses['401'] = errorResponse('Thiếu token, token sai hoặc hết hạn');
        operation.responses['403'] = errorResponse('Không đủ quyền');
      }
      if (path.includes('{')) operation.responses['404'] = errorResponse('Không tìm thấy');
      if (doc?.conflict) operation.responses['409'] = errorResponse(doc.conflict);
      if (key === 'POST /auth/login') operation.responses['401'] = errorResponse('Sai tên đăng nhập hoặc mật khẩu');
    }
  }
  return undocumented;
}

export function setupSwagger(app: INestApplication): void {
  if (process.env.SWAGGER_ENABLED === 'false') return;
  const config = new DocumentBuilder()
    .setTitle('KTX Care API')
    .setDescription('API quản lý ký túc xá. Đăng nhập ở POST /auth/login rồi bấm Authorize và dán access_token.')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const undocumented = applyEndpointDocs(document);
  if (undocumented.length) {
    new Logger('Swagger').warn(`Route chưa có mô tả trong swagger.ts: ${undocumented.join(', ')}`);
  }
  SwaggerModule.setup('api-docs', app, document, { swaggerOptions: { persistAuthorization: true } });
}
