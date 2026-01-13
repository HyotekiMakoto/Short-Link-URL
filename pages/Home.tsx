import React, { useState } from 'react';
import { suggestSlugs } from '../services/geminiService';
import { createShortLink } from '../services/mockBackend';
import { User } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleAiSuggest = async () => {
    if (!url) {
      setError("Vui lòng nhập URL trước để nhận gợi ý.");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const slugs = await suggestSlugs(url);
      setSuggestions(slugs);
    } catch (e) {
      setError("Không thể lấy gợi ý từ AI lúc này.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateLink = async () => {
    // Use custom slug or random one
    const finalSlug = customSlug || Math.random().toString(36).substring(2, 8);
    const link = await createShortLink(url, finalSlug, user ? user.id : 'guest');
    
    if (!user) {
      // Save guest link ID
      localStorage.setItem('guest_link_id', link.id);
      // Redirect to dashboard for guest
      navigate('/dashboard');
    } else {
      setResult(`${window.location.origin}/#/${link.slug}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // GUEST FLOW LOGIC
    if (!user) {
      const existingGuestLink = localStorage.getItem('guest_link_id');
      if (existingGuestLink) {
        if (!window.confirm("Bạn đang có một link rút gọn khách (chưa đăng nhập). Bạn chỉ được phép tồn tại 1 link đồng thời. Bạn có muốn xóa link cũ để tạo link mới không?")) {
          return;
        }
        // If they agree, we overwrite the local ID. The old one in DB will eventually be cleaned or ignored.
      }

      if (!window.confirm("CẢNH BÁO: Vì bạn chưa đăng nhập, link này sẽ chỉ tồn tại trong vòng 24 giờ và bạn chỉ được tạo 1 link duy nhất. Bạn có muốn tiếp tục?")) {
        return;
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      await handleCreateLink();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Section 1: Hero & Form - Takes full height minus navbar (4rem) */}
      {/* Gradient for dark mode is significantly darker/bolder as requested */}
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-[#0B1120] dark:via-[#1e1b4b] dark:to-black px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-200">
        <div className="max-w-3xl w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl drop-shadow-sm">
              Rút gọn link <span className="text-indigo-600 dark:text-indigo-400">tức thì</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Công cụ rút gọn liên kết đơn giản, nhanh chóng và mạnh mẽ. Tích hợp AI để tạo đường dẫn thân thiện.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="url" className="sr-only">URL dài</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="url"
                    id="url"
                    required
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md py-4 transition-colors"
                    placeholder="Dán đường dẫn dài của bạn vào đây..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex-1">
                  <label htmlFor="slug" className="sr-only">Tùy chỉnh đuôi (Optional)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">shortai.com/</span>
                    </div>
                    <input
                      type="text"
                      id="slug"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-28 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md py-3 transition-colors"
                      placeholder="tuy-chinh-link"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                    />
                  </div>
                </div>
                
                {user && (
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiLoading || !url}
                    className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {aiLoading ? (
                       <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        AI Gợi ý
                      </>
                    )}
                  </button>
                )}
              </div>

              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-full mb-1">Gợi ý từ AI:</span>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCustomSlug(s)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 cursor-pointer border border-purple-200 dark:border-purple-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 transition-all"
              >
                {loading ? 'Đang xử lý...' : 'Rút gọn ngay'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in-up">
                <h3 className="text-lg font-medium text-green-900 dark:text-green-300">Thành công! Link rút gọn của bạn:</h3>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    readOnly
                    type="text"
                    value={result}
                    className="flex-1 p-2 border border-green-300 dark:border-green-700 rounded text-green-800 dark:text-green-200 bg-white dark:bg-gray-700 focus:outline-none"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Sao chép
                  </button>
                </div>
                <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                  *Link này đã sẵn sàng sử dụng.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Features - Takes full height */}
      <div className="bg-white dark:bg-gray-800 min-h-screen flex flex-col justify-center py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Lựa chọn phù hợp với bạn</h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Bạn có thể sử dụng ngay mà không cần đăng nhập, hoặc tạo tài khoản để mở khóa toàn bộ tính năng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Guest Card */}
            <div className="relative bg-gray-50 dark:bg-gray-700 pt-8 px-6 pb-10 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-600 rounded-full p-4 border-4 border-white dark:border-gray-800">
                <svg className="h-8 w-8 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-center text-xl font-bold text-gray-900 dark:text-white mt-4">Người dùng Khách</h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">(Không cần đăng nhập)</p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Tạo link rút gọn tức thì</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-yellow-500">⚠</span>
                  <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Giới hạn <strong>1 link</strong> duy nhất</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-yellow-500">⚠</span>
                  <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Link tự động xóa sau <strong>24 giờ</strong></p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-red-500">✕</span>
                  <p className="ml-3 text-base text-gray-500 dark:text-gray-400">Không có thống kê chi tiết</p>
                </li>
              </ul>
            </div>

            {/* Registered User Card */}
            <div className="relative bg-indigo-50 dark:bg-indigo-900/20 pt-8 px-6 pb-10 rounded-2xl border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full p-4 border-4 border-white dark:border-gray-800">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-center text-xl font-bold text-gray-900 dark:text-white mt-4">Thành viên Đăng ký</h3>
              <p className="text-center text-sm text-indigo-500 dark:text-indigo-400 mt-2">(Hoàn toàn miễn phí)</p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">✓</span>
                  <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Tạo <strong>không giới hạn</strong> số lượng link</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">✓</span>
                  <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Link tồn tại vĩnh viễn (tùy chỉnh)</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">✓</span>
                  <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Xem biểu đồ & thống kê click</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">✓</span>
                  <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Sử dụng <strong>AI</strong> để gợi ý tên link</p>
                </li>
              </ul>
              {!user && (
                <div className="mt-8">
                  <Link to="/register" className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                    Đăng ký ngay
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;