import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { getCurrentUser } from './services/mockBackend';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'; // Import Provider
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import RedirectHandler from './pages/RedirectHandler';

// Wrapper for footer to use language context
const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                     <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} {t('footer.rights')} RLinkVN.
                        </p>
                     </div>
                     <div className="md:text-right">
                         <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('footer.contact')}</h4>
                         <div className="flex md:justify-end space-x-6">
                            <a href="https://www.facebook.com/amagirikiyori" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                                <span className="sr-only">Facebook</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="mailto:amagirikiyori@gmail.com" className="text-gray-400 hover:text-red-600 transition-colors">
                                <span className="sr-only">Email</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </a>
                         </div>
                     </div>
                </div>
            </div>
        </footer>
    );
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check User
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);

    // Check Theme
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <Navbar user={user} setUser={setUser} />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/dashboard" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              <Route path="/dashboard" element={
                user ? <Dashboard user={user} /> : <Navigate to="/login" />
              } />
              
              <Route path="/admin" element={
                user && (user.role === UserRole.ADMIN || user.role === UserRole.OWNER) ? <Admin currentUser={user} /> : <Navigate to="/" />
              } />

              {/* Handle Short Links - This catches paths like /abcxyz */}
              <Route path="/:slug" element={<RedirectHandler />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;