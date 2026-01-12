import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLinkBySlug, incrementClick } from '../services/mockBackend';

const RedirectHandler: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'expired' | 'not-found'>('checking');
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    if (!slug) {
        setStatus('not-found');
        return;
    }

    const checkLink = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const link = getLinkBySlug(slug);

      if (!link) {
        setStatus('not-found');
        return;
      }

      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        setStatus('expired');
        return;
      }

      // Record click and redirect
      incrementClick(link.id);
      setTargetUrl(link.originalUrl);
      setStatus('redirecting');
      
      // Perform redirect
      window.location.href = link.originalUrl;
    };

    checkLink();
  }, [slug]);

  if (status === 'checking' || status === 'redirecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-medium">
            {status === 'checking' ? 'Đang kiểm tra liên kết...' : 'Đang chuyển hướng...'}
        </p>
        {status === 'redirecting' && (
            <p className="text-xs text-gray-400 mt-2">Nếu trình duyệt không tự chuyển, <a href={targetUrl} className="text-indigo-600 underline">bấm vào đây</a>.</p>
        )}
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Liên kết đã hết hạn</h2>
          <p className="text-gray-600 mb-8">
            Đường dẫn rút gọn bạn truy cập đã hết thời hạn sử dụng và không còn khả dụng. Vui lòng liên hệ với người tạo link hoặc tạo một link mới.
          </p>
          <div className="flex flex-col space-y-3">
             <Link to="/" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
               Quay về trang chủ
             </Link>
             <Link to="/login" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
               Đăng nhập
             </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <p className="text-xl text-gray-600 mt-4">Không tìm thấy liên kết rút gọn này.</p>
            <div className="mt-8">
                <Link to="/" className="text-indigo-600 font-medium hover:text-indigo-500">
                    &larr; Quay về trang chủ
                </Link>
            </div>
        </div>
    </div>
  );
};

export default RedirectHandler;