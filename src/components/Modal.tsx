import { AlertTriangle, HelpCircle, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'info' | 'danger' | 'warning';
}

export default function Modal({
  isOpen,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  type = 'info',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in" 
        onClick={onCancel}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 z-10 animate-fade-in transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            type === 'danger' 
              ? 'bg-rose-50 text-rose-600' 
              : type === 'warning' 
              ? 'bg-amber-50 text-amber-600' 
              : 'bg-blue-50 text-blue-600'
          }`}>
            {type === 'danger' && <AlertTriangle className="w-7 h-7" />}
            {type === 'warning' && <HelpCircle className="w-7 h-7" />}
            {type === 'info' && <Info className="w-7 h-7" />}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2 font-jakarta">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer ${
              type === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-600/20'
                : type === 'warning'
                ? 'bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
