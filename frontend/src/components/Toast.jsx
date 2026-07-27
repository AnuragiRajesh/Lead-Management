import { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

/**
 * Usage: <Toast message="Saved!" type="success" onClose={() => setToast(null)} />
 * type: 'success' | 'error'
 */
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-up
        ${isSuccess ? 'bg-emerald-600' : 'bg-red-600'}`}
    >
      {isSuccess
        ? <CheckCircleIcon className="w-5 h-5 shrink-0" />
        : <XCircleIcon className="w-5 h-5 shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
