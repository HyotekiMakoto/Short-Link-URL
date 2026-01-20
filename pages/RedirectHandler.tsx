import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLinkBySlug, incrementClick } from '../services/mockBackend';
import { useLanguage } from '../contexts/LanguageContext';

const RedirectHandler: React.FC = () => {
  const { t } = useLanguage();
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 font-medium">
            {status === 'checking' ? t('redirect.checking') : t('redirect.redirecting')}
        </p>
        {status === 'redirecting' && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t('redirect.manual')} <a href={targetUrl} className="text-indigo-600 dark:text-indigo-400 underline">here</a>.</p>
        )}
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