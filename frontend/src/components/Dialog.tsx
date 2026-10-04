import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Dialog({
  open,
  onClose,
  title,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  return createPortal(
    <dialog
      ref={ref}
      className={`scout-dialog ${className}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      {open && (
        <>
          <div className="dialog-heading">
            <h2>{title}</h2>
            <button
              type="button"
              className="icon-button"
              onClick={onClose}
              aria-label={`Close ${title}`}
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </>
      )}
    </dialog>,
    document.body,
  );
}
