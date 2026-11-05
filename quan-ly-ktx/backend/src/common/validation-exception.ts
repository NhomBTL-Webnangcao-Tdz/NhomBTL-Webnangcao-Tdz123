import { BadRequestException, ValidationError } from '@nestjs/common';

const fieldLabels: Record<string, string> = {
  building: 'Tòa nhà',
  roomNumber: 'Số phòng',
  maxCapacity: 'Sức chứa',
  price: 'Giá thuê',
  sid: 'Mã sinh viên',
  sname: 'Họ tên',
  email: 'Email',
  phone: 'Số điện thoại',
  student: 'Sinh viên',
  room: 'Phòng',
  roomId: 'Phòng',
  start_date: 'Ngày bắt đầu',
  end_date: 'Ngày kết thúc',
  endDate: 'Ngày kết thúc',
  deposit_amount: 'Tiền đặt cọc',
  depositAmount: 'Tiền đặt cọc',
  is_active: 'Trạng thái hợp đồng',
  month: 'Tháng',
  year: 'Năm',
  old_electric_index: 'Chỉ số điện cũ',
  new_electric_index: 'Chỉ số điện mới',
  old_water_index: 'Chỉ số nước cũ',
  new_water_index: 'Chỉ số nước mới',
  total_amount: 'Tổng tiền',
  dueDate: 'Hạn thanh toán',
  is_paid: 'Trạng thái thanh toán',
  isPaid: 'Trạng thái thanh toán',
  reviewNote: 'Ghi chú',
  amount: 'Số tiền',
  payment_date: 'Ngày thanh toán',
  payment_type: 'Loại thanh toán',
  contractId: 'Hợp đồng',
  isMaintenance: 'Trạng thái phòng',
};

// Câu có dấu tiếng Việt là thông báo viết riêng trong DTO, giữ nguyên.
const hasCustomMessage = (message: string) => /[^\x00-\x7F]/.test(message);

function collect(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const label = fieldLabels[error.property] ?? error.property;
    const own = Object.entries(error.constraints ?? {}).map(([rule, message]) => {
      if (hasCustomMessage(message)) return message;
      if (rule === 'whitelistValidation') return `Không được gửi trường ${error.property}.`;
      return `${label} không hợp lệ.`;
    });
    return [...own, ...collect(error.children ?? [])];
  });
}

/** Trả thông báo tiếng Việt thay cho câu tiếng Anh mặc định của class-validator. */
export function validationExceptionFactory(errors: ValidationError[]): BadRequestException {
  return new BadRequestException([...new Set(collect(errors))]);
}
