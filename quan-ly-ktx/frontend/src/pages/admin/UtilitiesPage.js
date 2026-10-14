import { useMemo, useState } from 'react';
import { billApi } from '../../api/bill.api';
import BillForm from '../../components/common/BillForm';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PageHeading from '../../components/common/PageHeading';
import useApiResource from '../../hooks/useApiResource';

export default function UtilitiesPage() {
  const { data: bills, isLoading, error, refresh } = useApiResource(billApi.list);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeBill, setActiveBill] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const selectedBills = useMemo(() => bills.filter((bill) => Number(bill.month) === Number(month) && Number(bill.year) === Number(year)), [bills, month, year]);

  const saveReadings = async (bill) => {
    setSaving(true);
    setSaveError('');
    try {
      if (activeBill) await billApi.update(activeBill.bill_id, bill);
      else await billApi.create(bill);
      setActiveBill(null);
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'bill_id', label: 'Mã hóa đơn', render: (bill) => `HD-${bill.bill_id}` },
    { key: 'old_electric_index', label: 'Điện cũ (kWh)' },
    { key: 'new_electric_index', label: 'Điện mới (kWh)' },
    { key: 'electricUsage', label: 'Tiêu thụ điện', render: (bill) => `${Math.max(0, bill.new_electric_index - bill.old_electric_index)} kWh` },
    { key: 'old_water_index', label: 'Nước cũ (m³)' },
    { key: 'new_water_index', label: 'Nước mới (m³)' },
    { key: 'waterUsage', label: 'Tiêu thụ nước', render: (bill) => `${Math.max(0, bill.new_water_index - bill.old_water_index)} m³` },
    { key: 'actions', label: '', render: (bill) => <button className="text-button" onClick={() => { setSaveError(''); setActiveBill(bill); }}>Cập nhật</button> },
  ];

  return (
    <>
      <PageHeading eyebrow="CHỐT CHỈ SỐ HÀNG THÁNG" title="Nhập chỉ số điện nước" description="Chọn kỳ ghi nhận và cập nhật số liệu công tơ." action={<button className="button button-primary" onClick={() => { setActiveBill({ month: Number(month), year: Number(year) }); setSaveError(''); }}>＋ Thêm chỉ số</button>} />
      <section className="panel">
        <div className="table-toolbar">
          <div className="period-picker"><label>Tháng<select value={month} onChange={(event) => setMonth(Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label><label>Năm<input type="number" min="2000" value={year} onChange={(event) => setYear(Number(event.target.value))} /></label></div>
          <span className="toolbar-count">{selectedBills.length} bản ghi</span>
        </div>
        <div className="inline-notice">Chỉ số cũ được điền từ bản ghi đã lưu nếu có. Backend hiện chưa hỗ trợ nhập hàng loạt theo tòa, cảnh báo tăng đột biến hoặc liên kết công tơ với phòng.</div>
        <DataTable columns={columns} rows={selectedBills} rowKey={(bill) => bill.bill_id} isLoading={isLoading} error={error} onRetry={refresh} emptyMessage="Chưa có bản ghi chỉ số trong kỳ này." />
      </section>
      {activeBill && <Modal title={activeBill.bill_id ? `Cập nhật chỉ số · HD-${activeBill.bill_id}` : 'Thêm chỉ số điện nước'} onClose={() => { setActiveBill(null); setSaveError(''); }} wide><BillForm value={activeBill} onSave={saveReadings} onCancel={() => { setActiveBill(null); setSaveError(''); }} saving={saving} error={saveError} /></Modal>}
    </>
  );
}
