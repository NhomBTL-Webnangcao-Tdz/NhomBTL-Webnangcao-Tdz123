import BootstrapModal from 'react-bootstrap/Modal';

export default function Modal({ title, children, onClose, wide = false }) {
  return (
    <BootstrapModal
      show
      onHide={onClose}
      centered
      animation={false}
      aria-label={title}
      dialogClassName={wide ? 'app-modal app-modal-wide' : 'app-modal'}
      contentClassName="modal-card"
    >
      <BootstrapModal.Header closeButton closeLabel="Đóng">
        <BootstrapModal.Title as="h2">{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      {children}
    </BootstrapModal>
  );
}
