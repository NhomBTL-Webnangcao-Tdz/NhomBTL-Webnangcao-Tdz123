import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import './FeedbackProvider.css';

// Giá trị mặc định để component chạy được khi không nằm trong provider (VD khi test riêng).
const FeedbackContext = createContext({
  notify: () => {},
  confirm: async (message) => window.confirm(message),
});

export function useFeedback() {
  return useContext(FeedbackContext);
}

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const nextToastId = useRef(1);

  // type: 'success' hoặc 'error'.
  const notify = useCallback((message, type = 'success') => {
    const id = nextToastId.current;
    nextToastId.current += 1;
    setToasts((current) => [...current, { id, message, type }]);
  }, []);

  const confirm = useCallback((message, confirmLabel = 'Xác nhận') => new Promise((resolve) => {
    setDialog({ message, confirmLabel, resolve });
  }), []);

  const closeDialog = (accepted) => {
    dialog.resolve(accepted);
    setDialog(null);
  };

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <ToastContainer position="top-end" className="feedback-toasts p-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            bg={toast.type === 'error' ? 'danger' : 'success'}
            autohide
            delay={toast.type === 'error' ? 6000 : 3500}
            onClose={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
          >
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
      <Modal show={Boolean(dialog)} onHide={() => closeDialog(false)} centered size="sm" backdrop={false} className="feedback-confirm">
        <Modal.Body>{dialog?.message}</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => closeDialog(false)}>Hủy</Button>
          <Button variant="danger" size="sm" onClick={() => closeDialog(true)}>{dialog?.confirmLabel}</Button>
        </Modal.Footer>
      </Modal>
    </FeedbackContext.Provider>
  );
}
