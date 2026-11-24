import { useEffect, useRef, type ReactNode } from 'react';

type Props = { open: boolean; labelledBy: string; onClose: () => void; children: ReactNode };

/** Native modal dialog: focus trap, Escape and backdrop come from the browser. */
export function Modal({ open, labelledBy, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="confirm"
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && children}
    </dialog>
  );
}
