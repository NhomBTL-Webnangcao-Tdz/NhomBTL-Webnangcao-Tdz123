export function LoadingState({ message = 'Đang tải dữ liệu...' }) {
  return <p className="async-state" role="status">{message}</p>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="async-state async-error" role="alert">
      <p>{message}</p>
      {onRetry && <button className="button button-secondary" onClick={onRetry}>Thử lại</button>}
    </div>
  );
}

export function EmptyState({ message = 'Chưa có dữ liệu để hiển thị.' }) {
  return <p className="async-state">{message}</p>;
}
