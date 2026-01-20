import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface BulkInfoModalProps {
  onClose: () => void;
}

const BulkInfoModal: React.FC<BulkInfoModalProps> = ({ onClose }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6 border border-gray-200 dark:border-gray-700 animate-scale-in">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                {t('modal.bulk_info.title')}
              </h3>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-left space-y-3">
                <p>{t('modal.bulk_info.p1')}</p>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                  <p className="font-semibold mb-1">{t('modal.bulk_info.p2')}</p>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-1 rounded text-xs text-indigo-600 dark:text-indigo-400 font-mono mb-2">
                    {t('modal.bulk_info.format')}
                  </code>
                  <p className="font-semibold mb-1">{t('modal.bulk_info.example')}</p>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                    {t('modal.bulk_info.line1')}<br/>
                    {t('modal.bulk_info.line2')}
                  </code>
                </div>

                <p className="text-xs italic text-gray-400">
                    {t('modal.bulk_info.note')}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              onClick={onClose}
            >
              {t('common.understand')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkInfoModal;