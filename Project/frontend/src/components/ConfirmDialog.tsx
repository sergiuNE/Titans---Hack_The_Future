import type { ReactNode } from 'react';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  title: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Yes/no question. Escape, the backdrop and the first (focused) button all keep things as they are. */
export function ConfirmDialog({ open, title, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} labelledBy="confirm-title" onClose={onCancel}>
      <p id="confirm-title" className="confirm-title">
        {title}
      </p>
      <div className="confirm-actions">
        <button className="confirm-keep" onClick={onCancel} autoFocus>
          {cancelLabel}
        </button>
        <button className="confirm-undo" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
