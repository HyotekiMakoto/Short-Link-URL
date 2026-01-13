import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  originalUrl: string;
  slug: string;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ originalUrl, slug, onClose }) => {
  const [dataUrl, setDataUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateCombinedImage = async () => {
      try {
        setLoading(true);
        // 1. Generate the QR Code as a Data URL
        const qrCodeUrl = await QRCode.toDataURL(originalUrl, { 
          width: 200, 
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        // 2. Create a Canvas to combine elements
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Canvas dimensions
        const width = 300;
        const height = 350;
        canvas.width = width;
        canvas.height = height;

        // 3. Draw Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // 4. Draw Website Name (Header)
        ctx.fillStyle = '#4F46E5'; // Indigo-600
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ShortAI', width / 2, 40);

        // 5. Draw QR Code Image
        const qrImage = new Image();
        qrImage.src = qrCodeUrl;
        
        await new Promise((resolve) => {
            qrImage.onload = () => {
                // Center the QR code (200x200)
                ctx.drawImage(qrImage, (width - 200) / 2, 80);
                resolve(true);
            };
        });

        // 6. Draw Footer Label
        ctx.fillStyle = '#6B7280'; // Gray-500
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Quét để truy cập:', width / 2, 295);

        // 7. Draw Original URL (Footer)
        ctx.fillStyle = '#111827'; // Gray-900
        ctx.font = '13px Inter, sans-serif';
        
        // Truncate URL if too long
        let displayUrl = originalUrl;
        if (displayUrl.length > 35) {
            displayUrl = displayUrl.substring(0, 32) + '...';
        }
        ctx.fillText(displayUrl, width / 2, 315);

        // 8. Set result
        setDataUrl(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error("Failed to generate QR canvas", error);
      } finally {
        setLoading(false);
      }
    };

    generateCombinedImage();
  }, [originalUrl]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
              Mã QR cho /{slug}
            </h3>
            <div className="mt-4 flex justify-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              {dataUrl ? (
                <img src={dataUrl} alt="QR Code" className="shadow-sm rounded max-w-full h-auto" />
              ) : (
                <div className="h-64 w-64 flex items-center justify-center bg-gray-100 dark:bg-gray-600 rounded">
                  <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 rounded-full"></div>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 px-2">
                Hình ảnh tải xuống sẽ bao gồm tên website và link gốc.
            </p>
          </div>
          <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
             <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:text-sm"
              onClick={onClose}
            >
              Đóng
            </button>
            <a
              href={dataUrl}
              download={`ShortAI-${slug}.png`}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm ${loading ? 'pointer-events-none opacity-50' : ''}`}
            >
              Tải xuống
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;