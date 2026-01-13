import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { logout, getLanguageSettings, setLanguage as saveLanguageService } from '../services/mockBackend';

interface NavbarProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Desktop settings dropdown state
  
  // Settings State
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('vi');

  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Init Theme State
    if (document.documentElement.classList.contains('dark')) {
      setDarkMode(true);
    }
    // Init Lang State
    const settings = getLanguageSettings();
    setLanguage(settings.currentLang);

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'vi' ? 'en' : 'vi';
    setLanguage(newLang);
    saveLanguageService(newLang);
    // In a real app with i18n, this would trigger a re-render of all text
    // For now, we just update the state/storage to demonstrate functionality
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      setUser(null);
      navigate('/login');
      setIsOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const desktopLinkClass = (path: string) => 
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
      isActive(path) 
        ? 'border-indigo-500 text-gray-900 dark:text-white' 
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
    }`;

  const mobileLinkClass = (path: string) =>
    `block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
    }`;

  const canAccessAdmin = user && (user.role === UserRole.ADMIN || user.role === UserRole.OWNER);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={() => setIsOpen(false)}>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                ShortAI
              </span>
            </Link>
            {/* Desktop Menu Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={desktopLinkClass('/')}>
                Trang chủ
              </Link>
              {user && (
                <Link to="/dashboard" className={desktopLinkClass('/dashboard')}>
                  Thống kê
                </Link>
              )}
              {canAccessAdmin && (
                <Link to="/admin" className={desktopLinkClass('/admin')}>
                  Quản trị
                </Link>
              )}
            </div>
          </div>
          
          {/* Desktop User Actions & Settings */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            
            {/* Settings Dropdown (Desktop) */}
            <div className="relative" ref={settingsRef}>
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
                title="Cài đặt"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {isSettingsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-down z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Tùy chọn</p>
                  </div>
                  
                  {/* Dark Mode Toggle */}
                  <button 
                    onClick={toggleDarkMode}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      {darkMode ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                         </svg>
                      ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                         </svg>
                      )}
                      {darkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
                    </span>
                    <div className={`w-8 h-4 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 duration-300 ease-in-out ${darkMode ? 'bg-indigo-500' : ''}`}>
                      <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${darkMode ? 'translate-x-3' : ''}`}></div>
                    </div>
                  </button>

                  {/* Language Toggle */}
                  <button 
                    onClick={toggleLanguage}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      Ngôn ngữ
                    </span>
                    <span className="font-bold text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded uppercase">
                        {language}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">Xin chào, <strong>{user.name}</strong></span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-md transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                  Đăng nhập
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            to="/" 
            className={mobileLinkClass('/')}
            onClick={() => setIsOpen(false)}
          >
            Trang chủ
          </Link>
          {user && (
            <Link 
              to="/dashboard" 
              className={mobileLinkClass('/dashboard')}
              onClick={() => setIsOpen(false)}
            >
              Thống kê
            </Link>
          )}
          {canAccessAdmin && (
            <Link 
              to="/admin" 
              className={mobileLinkClass('/admin')}
              onClick={() => setIsOpen(false)}
            >
              Quản trị
            </Link>
          )}
        </div>

        {/* Mobile Settings (Combined in Hamburger) */}
        <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
           <div className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
               Cài đặt
           </div>
           
           {/* Mobile Dark Mode */}
           <button 
             onClick={toggleDarkMode}
             className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
           >
             {darkMode ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                 </svg>
             ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                 </svg>
             )}
             {darkMode ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
           </button>

           {/* Mobile Language */}
           <button 
             onClick={toggleLanguage}
             className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
             </svg>
             Ngôn ngữ: <span className="ml-2 uppercase font-bold text-indigo-600 dark:text-indigo-400">{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
           </button>
        </div>
        
        {/* Mobile User Actions */}
        <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          {user ? (
            <div className="space-y-1">
              <div className="px-4 flex items-center mb-3">
                 <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xl">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                 </div>
                 <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                 </div>
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-800"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="px-4 space-y-2">
              <Link 
                to="/login" 
                className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                onClick={() => setIsOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="block w-full text-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setIsOpen(false)}
              >
                Đăng ký ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;