import { useMemo, useState } from 'react';
import { billApi } from '../../api/bill.api';
import BillForm from '../../components/common/BillForm';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import useApiResource from '../../hooks/useApiResource';

export default function BillsPage() {
  const { data: bills, isLoading, error, refresh } = useApiResource(billApi.list);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeBill, setActiveBill] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const filtered = useMemo(() => bills.filter((bill) => {
    const matches = `HD-${bill.bill_id} ${bill.month}/${bill.year}`.toLowerCase().includes(search.trim().toLowerCase());
    return matches && (statusFilter === 'all' || (statusFilter === 'paid' ? bill.is_paid : !bill.is_paid));
  }), [bills, search, statusFilter]);

  const closeForm = () => { setFormOpen(false); setActiveBill(null); setSaveError(''); };
  const saveBill = async (bill) => {
    setSaving(true);
    setSaveError('');
    try {
      if (activeBill) await billApi.update(activeBill.bill_id, bill);
      else await billApi.create(bill);
      closeForm();
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  };
  const removeBill = async (bill) => {
    if (!window.confirm(`Xóa hóa đơn #${bill.bill_id}?`)) return;
    try {
      await billApi.remove(bill.bill_id);
      refresh();
    } catch (requestError) {
      setSaveError(requestError.message);
      setActiveBill(bill);
      setFormOpen(true);
    }
  };

  const columns = [
    { key: 'bill_id', label: 'Mã hóa đơn', render: (bill) => `HD-${String(bill.bill_id).padStart(4, '0')}` },
    { key: 'period', label: 'Kỳ thanh toán', render: (bill) => `${String(bill.month).padStart(2, '0')}/${bill.year}` },
    { key: 'electric', label: 'Điện tiêu thụ', render: (bill) => `${Math.max(0, bill.new_electric_index - bill.old_electric_index)} kWh` },
    { key: 'water', label: 'Nước tiêu thụ', render: (bill) => `${Math.max(0, bill.new_water_index - bill.old_water_index)} m³` },
    { key: 'total_amount', label: 'Tổng tiền', render: (bill) => `${Number(bill.total_amount).toLocaleString('vi-VN')} ₫` },
    { key: 'is_paid', label: 'Trạng thái', render: (bill) => <StatusBadge value={bill.is_paid ? 'paid' : 'unpaid'} label={bill.is_paid ? 'Đã thanh toán' : 'Chưa thanh toán'} /> },
    { key: 'actions', label: '', render: (bill) => <div className="row-actions"><button className="text-button" onClick={() => { setActiveBill(bill); setFormOpen(true); }}>Chi tiết / Sửa</button><button className="text-button danger-text" onClick={() => removeBill(bill)}>Xóa</button></div> },
  ];

  return (
    <>
      <PageHeading eyebrow="THU CHI & CÔNG NỢ" title="Hóa đơn & Dịch vụ" description="Theo dõi kỳ hóa đơn điện nước và tình trạng thanh toán." action={<button className="button button-primary" onClick={() => setFormOpen(true)}>＋ Tạo hóa đơn</button>} />
      <div className="stat-grid compact-stats">
        <article className="stat-card"><span className="stat-label">Tổng hóa đơn</span><strong>{bills.length}</strong></article>
        <article className="stat-card"><span className="stat-label">Đã thanh toán</span><strong>{bills.filter((bill) => bill.is_paid).length}</strong></article>
        <article className="stat-card"><span className="stat-label">Chưa thanh toán</span><strong>{bills.filter((bill) => !bill.is_paid).length}</strong></article>
        <article className="stat-card"><span className="stat-label">Tổng giá trị hóa đơn</span><strong>{bills.reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0).toLocaleString('vi-VN')} ₫</strong></article>
      </div>
      <section className="panel">
        <div className="table-toolbar">
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hóa đơn hoặc kỳ thanh toán" aria-label="Tìm hóa đơn" /></label>
          <label className="compact-select">Thanh toán<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Tất cả</option><option value="unpaid">Chưa thanh toán</option><option value="paid">Đã thanh toán</option></select></label>
        </div>
        <DataTable columns={columns} rows={filtered} rowKey={(bill) => bill.bill_id} isLoading={isLoading} error={error} onRetry={refresh} emptyMessage="Không tìm thấy hóa đơn." />
      </section>
      {formOpen && <Modal title={activeBill ? `Hóa đơn #${activeBill.bill_id}` : 'Tạo hóa đơn điện nước'} onClose={closeForm} wide><BillForm value={activeBill} onSave={saveBill} onCancel={closeForm} saving={saving} error={saveError} /></Modal>}
    </>
  );
}
