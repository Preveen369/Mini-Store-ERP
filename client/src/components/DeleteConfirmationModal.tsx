import { AlertCircle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  warningMessage?: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  title,
  message,
  warningMessage,
  itemName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 text-center mb-4">
          {message}
          {itemName && <strong className="block mt-1">{itemName}</strong>}
        </p>
        
        {warningMessage && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> {warningMessage}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="btn-secondary px-6 btn"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white px-6 btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
