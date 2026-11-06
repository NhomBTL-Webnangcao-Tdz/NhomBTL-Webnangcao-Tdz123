/**
 * @jest-environment node
 */
import ExcelJS from 'exceljs';
import { createWorkbookBuffer } from './exportExcel';

const columns = [
  { label: 'Phòng', value: (row) => row.room },
  { label: 'Giá thuê', value: (row) => row.price, money: true },
];

async function readSheet(rows) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await createWorkbookBuffer({ sheetName: 'Phòng', columns, rows }));
  return workbook.getWorksheet('Phòng');
}

test('ghi tiêu đề, tiếng Việt và số tiền dạng số', async () => {
  const sheet = await readSheet([{ room: 'Tòa Á 101', price: 1200000 }]);

  expect(sheet.getRow(1).values.slice(1)).toEqual(['Phòng', 'Giá thuê']);
  expect(sheet.getCell('A2').value).toBe('Tòa Á 101');
  expect(sheet.getCell('B2').value).toBe(1200000);
  expect(sheet.getCell('B2').numFmt).toContain('#,##0');
});

test('chuỗi bắt đầu bằng dấu = vẫn là văn bản, không thành công thức', async () => {
  const sheet = await readSheet([{ room: '=HYPERLINK("http://x","y")', price: 0 }]);

  expect(sheet.getCell('A2').type).toBe(ExcelJS.ValueType.String);
  expect(sheet.getCell('A2').value).toBe('=HYPERLINK("http://x","y")');
});

test('không có dòng dữ liệu thì chỉ có tiêu đề', async () => {
  const sheet = await readSheet([]);

  expect(sheet.rowCount).toBe(1);
});

test('tên sheet có ký tự cấm hoặc quá dài vẫn tạo được file', async () => {
  const buffer = await createWorkbookBuffer({ sheetName: `Danh sách phòng Tòa A/B ${'x'.repeat(40)}`, columns, rows: [] });
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer);

  expect(workbook.worksheets[0].name).toHaveLength(31);
  expect(workbook.worksheets[0].name).not.toContain('/');
});
