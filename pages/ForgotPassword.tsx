import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { recoverPassword } from '../services/mockBackend';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await recoverPassword(email);
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Quên mật khẩu</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập email để lấy lại mật khẩu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'success' ? (
             <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Đã gửi yêu cầu</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu cho bạn.</p>
                  </div>
                  <div className="mt-4">
                     <Link to="/login" className="text-sm font-medium text-green-800 hover:text-green-900"> Quay lại đăng nhập </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="text-red-600 text-sm text-center">{errorMsg}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                >
                  {status === 'loading' ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          )}

           {status !== 'success' && (
             <div className="mt-6 text-center">
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 text-sm">
                   Quay lại đăng nhập
                </Link>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;