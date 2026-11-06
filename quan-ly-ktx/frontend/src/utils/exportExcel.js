const MONEY_FORMAT = '#,##0" ₫"';

/**
 * Tạo nội dung file Excel. Giá trị chuỗi được ghi dạng văn bản nên dữ liệu người dùng
 * như "=1+1" không chạy thành công thức khi mở file.
 */
export async function createWorkbookBuffer({ sheetName, columns, rows }) {
  // Tải thư viện khi bấm nút để không làm nặng lần mở trang đầu.
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  // Excel cấm các ký tự này trong tên sheet và giới hạn 31 ký tự.
  const sheet = workbook.addWorksheet(sheetName.replace(/[*?:/[\]]/g, ' ').slice(0, 31));

  sheet.columns = columns.map((column) => ({
    header: column.label,
    width: column.width || 16,
    style: column.money ? { numFmt: MONEY_FORMAT } : {},
  }));
  rows.forEach((row) => sheet.addRow(columns.map((column) => column.value(row))));
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  return workbook.xlsx.writeBuffer();
}

export async function exportExcel({ fileName, ...table }) {
  const buffer = await createWorkbookBuffer(table);
  const url = URL.createObjectURL(new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
