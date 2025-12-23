import clsx from 'clsx';
import { createPortal } from 'react-dom';
import Box from './Box';

export type ModalProps = React.PropsWithChildren<{
  open?: boolean;
  onClose?: () => void;
}>;

const Modal = ({ open, onClose, children }: ModalProps) => {
  if (!open) return null;

  return createPortal(
    <div
      className={clsx(
        'absolute top-0 left-0 w-screen h-screen z-10 transition',
        open ? 'bg-black/40 backdrop-blur-md' : 'opacity-0 pointer-events-none',
        'flex items-center justify-center',
      )}
      onClick={onClose}
    >
      <Box
        className="max-w-lg w-full m-4 not-dark:bg-white not-dark:border-purple-400! backdrop-blur-none!"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </Box>
    </div>,
    document.body,
  );
};

export default Modal;
