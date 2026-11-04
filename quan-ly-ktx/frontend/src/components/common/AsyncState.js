import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

export function LoadingState({ message = 'Đang tải dữ liệu...' }) {
  return <p className="async-state" role="status"><Spinner as="span" animation="border" size="sm" aria-hidden="true" /> {message}</p>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <Alert variant="danger" className="async-state async-error">
      <p>{message}</p>
      {onRetry && <Button variant="outline-secondary" className="button button-secondary" onClick={onRetry}>Thử lại</Button>}
    </Alert>
  );
}

export function EmptyState({ message = 'Chưa có dữ liệu để hiển thị.' }) {
  return <p className="async-state">{message}</p>;
}
