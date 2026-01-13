import React, { useState } from 'react';
import { bulkCreateShortLinks } from '../services/mockBackend';

interface BulkCreateModalProps {
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
}

const BulkCreateModal: React.FC<BulkCreateModalProps> = ({ userId, onSuccess, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: number, errors: string[]} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setLoading(false);
        return;
      }

      // Simple CSV Parse: url,slug (optional)
      const lines = text.split(/\r?\n/);
      const items: { url: string; slug?: string }[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const [url, slug] = trimmed.split(',').map(s => s.trim());
        if (url) {
            // Basic URL validation could go here
            items.push({ url, slug });
        }
      }

      if (items.length === 0) {
         setLoading(false);
         alert("File trống hoặc không đúng định dạng.");
         return;
      }

      const res = await bulkCreateShortLinks(items, userId);
      setResult(res);
      setLoading(false);
      if (res.success > 0) onSuccess();
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                Tạo Link Hàng Loạt (CSV)
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Tải lên file .csv (không có header) với định dạng: <code>URL, Slug(tùy chọn)</code>
                </p>
                
                {!result ? (
                   <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="space-y-1 text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none">
                          <span className="px-2">Chọn file CSV</span>
                          <input id="file-upload" name="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {file ? file.name : 'Chưa chọn file'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md bg-gray-50 dark:bg-gray-700 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Kết quả xử lý</h3>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          <p className="text-green-600 dark:text-green-400">✓ Thành công: {result.success}</p>
                          {result.errors.length > 0 && (
                            <div className="mt-2">
                                <p className="text-red-600 dark:text-red-400 font-medium">⚠ Lỗi ({result.errors.length}):</p>
                                <ul className="list-disc list-inside text-red-500 dark:text-red-300 text-xs mt-1 max-h-32 overflow-y-auto">
                                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            {!result ? (
                <button
                    type="button"
                    disabled={!file || loading}
                    onClick={handleUpload}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                >
                    {loading ? 'Đang xử lý...' : 'Tải lên & Tạo'}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                    Hoàn tất
                </button>
            )}
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateModal;