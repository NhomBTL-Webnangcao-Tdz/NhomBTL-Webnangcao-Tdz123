import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from 'react-bootstrap/Button';
import { exportExcel } from '../../utils/exportExcel';
import { useFeedback } from './FeedbackProvider';
import './ExportButtons.css';

const printValue = (column, row) => {
  const value = column.value(row);
  return column.money ? `${Number(value || 0).toLocaleString('vi-VN')} ₫` : value;
};

/**
 * Nút xuất Excel, PDF cho một bảng dữ liệu.
 * columns: [{ label, value(row), width?, money? }]; rows là các dòng đang hiện sau khi lọc.
 *
 * PDF dùng hộp in của trình duyệt (chọn Lưu dưới dạng PDF) nên tiếng Việt hiện đúng mà không cần nhúng font.
 * Bảng in do React dựng, dữ liệu người dùng không được chèn dạng HTML.
 */
export default function ExportButtons({ title, fileName, columns, rows }) {
  const { notify } = useFeedback();
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const fullFileName = `${fileName}-${new Date().toISOString().slice(0, 10)}`;

  useEffect(() => {
    if (!printing) return undefined;
    const finish = () => setPrinting(false);
    document.body.classList.add('printing-sheet');
    window.addEventListener('afterprint', finish);
    window.print();
    return () => {
      window.removeEventListener('afterprint', finish);
      document.body.classList.remove('printing-sheet');
    };
  }, [printing]);

  const downloadExcel = async () => {
    setExporting(true);
    try {
      await exportExcel({ fileName: fullFileName, sheetName: title, columns, rows });
      notify(`Đã xuất ${rows.length} dòng ra file Excel.`);
    } catch {
      notify('Không thể tạo file Excel. Vui lòng thử lại.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-buttons">
      <Button variant="outline-secondary" className="button button-secondary" disabled={!rows.length || exporting} onClick={downloadExcel}>{exporting ? 'Đang xuất...' : 'Xuất Excel'}</Button>
      <Button variant="outline-secondary" className="button button-secondary" disabled={!rows.length || printing} onClick={() => setPrinting(true)}>Xuất PDF</Button>
      {printing && createPortal(
        <section className="print-sheet">
          <h1>KTX Care · {title}</h1>
          <p>Ngày xuất {new Date().toLocaleDateString('vi-VN')} · {rows.length} dòng</p>
          <table>
            <thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}</tr></thead>
            <tbody>{rows.map((row, index) => (
              <tr key={index}>{columns.map((column) => <td key={column.label}>{printValue(column, row)}</td>)}</tr>
            ))}</tbody>
          </table>
        </section>,
        document.body,
      )}
    </div>
  );
}
