import { useEffect, useState } from 'react';
import { billApi } from '../../api/bill.api';

export default function InvoiceReceiptLink({ billId }) {
  const [receiptUrl, setReceiptUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    billApi.getReceipt(billId)
      .then((url) => {
        objectUrl = url;
        if (active) setReceiptUrl(url);
        else URL.revokeObjectURL(url);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Không thể tải ảnh hóa đơn.');
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [billId]);

  if (error) return <span className="form-error">{error}</span>;
  if (!receiptUrl) return <span className="async-state">Đang tải ảnh...</span>;
  return <a className="text-button" href={receiptUrl} target="_blank" rel="noreferrer">Xem ảnh hóa đơn</a>;
}
