import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLinkBySlug, incrementClick } from '../services/mockBackend';
import { useLanguage } from '../contexts/LanguageContext';

const RedirectHandler: React.FC = () => {
  const { t } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<'checking' | 'waiting' | 'expired' | 'not-found'>('checking');
  const [targetUrl, setTargetUrl] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [linkId, setLinkId] = useState<string | null>(null);

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

      setTargetUrl(link.originalUrl);
      setLinkId(link.id);
      setStatus('waiting');
    };

    checkLink();
  }, [slug]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'waiting' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  const handleRedirect = () => {
    if (linkId) {
      incrementClick(linkId);
    }
    window.location.href = targetUrl;
  };

  const handlePreview = async () => {
    setShowPreview(true);
    if (previewData) return; // Already fetched
    setPreviewLoading(true);
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setPreviewData(data.data);
      } else {
        setPreviewData({ error: true });
      }
    } catch (e) {
      setPreviewData({ error: true });
    } finally {
      setPreviewLoading(false);
    }
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 font-medium">
            {t('redirect.checking')}
        </p>
      </div>
    );
  }

  if (status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chuyển hướng</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bạn đang được chuyển hướng đến một trang web bên ngoài.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={handlePreview}
              className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 rounded-md font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              Xem trước
            </button>
            <button
              onClick={handleRedirect}
              disabled={countdown > 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {countdown > 0 ? `Chuyển hướng (${countdown}s)` : 'Chuyển hướng'}
            </button>
          </div>

          {showPreview && (
            <div className="mt-6 text-left border-t border-gray-200 dark:border-gray-700 pt-6 animate-fade-in-up">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Thông tin trang đích</h3>
              {previewLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : previewData && !previewData.error ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate" title={targetUrl}>
                    <strong>Domain:</strong> {new URL(targetUrl).hostname}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                    {previewData.title || 'Không có tiêu đề'}
                  </p>
                  {previewData.image && previewData.image.url && (
                    <img src={previewData.image.url} alt="Preview" className="w-full h-auto rounded-md mt-2" referrerPolicy="no-referrer" />
                  )}
                  {previewData.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                      {previewData.description}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate" title={targetUrl}>
                    <strong>Domain:</strong> {new URL(targetUrl).hostname}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Không thể tải thông tin xem trước cho trang này.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center border border-gray-100 dark:border-gray-700">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('redirect.expired.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('redirect.expired.desc')}
          </p>
          <div className="flex flex-col space-y-3">
             <Link to="/" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
               {t('redirect.btn.home')}
             </Link>
             <Link to="/login" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
               {t('nav.login')}
             </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
        <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white">{t('redirect.404.title')}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">{t('redirect.404.desc')}</p>
            <div className="mt-8">
                <Link to="/" className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300">
                    &larr; {t('redirect.btn.home')}
                </Link>
            </div>
        </div>
    </div>
  );
};

export default RedirectHandler;