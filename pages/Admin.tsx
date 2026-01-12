import React, { useEffect, useState } from 'react';
import { User, ShortLink, UserRole } from '../types';
import { getAllUsers, getAllLinks, deleteUser, deleteLink, updateUserRole } from '../services/mockBackend';

interface AdminProps {
  currentUser: User;
}

const Admin: React.FC<AdminProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'links'>('users');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(getAllUsers());
    setLinks(getAllLinks());
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert("Bạn không thể xóa chính mình.");
      return;
    }
    if (window.confirm("CẢNH BÁO: Xóa người dùng sẽ xóa tất cả link của họ. Tiếp tục?")) {
      deleteUser(id);
      refreshData();
    }
  };

  const handleRoleChange = (user: User) => {
    if (user.id === currentUser.id) {
        alert("Bạn không thể tự thay đổi quyền của chính mình.");
        return;
    }

    const newRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    const confirmMsg = `Bạn có chắc chắn muốn thay đổi quyền của "${user.name}" từ ${user.role} thành ${newRole} không?`;
    
    if (window.confirm(confirmMsg)) {
        updateUserRole(user.id, newRole);
        refreshData();
    }
  };

  const handleDeleteLink = (id: string) => {
    if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa link này khỏi hệ thống không?")) {
      deleteLink(id);
      refreshData();
    }
  };

  const handleSimulateVisit = (slug: string) => {
    const url = `${window.location.origin}/#/${slug}`;
    window.open(url, '_blank');
  };

  if (currentUser.role !== UserRole.ADMIN) {
    return <div className="p-10 text-center text-red-600">Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Trang Quản Trị</h1>
          <p className="mt-2 text-sm text-gray-700">Quản lý người dùng và tất cả các link trong hệ thống.</p>
        </div>
      </div>

      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Người dùng ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`${activeTab === 'links' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Tất cả Links ({links.length})
          </button>
        </nav>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              
              {activeTab === 'users' && (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tên</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vai trò</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{user.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <button 
                            onClick={() => handleRoleChange(user)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer border hover:opacity-80 transition-opacity ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-green-100 text-green-800 border-green-200'}`}
                            title="Nhấn để đổi vai trò"
                          >
                            {user.role} <span className="ml-1 text-[10px] opacity-60">⇄</span>
                          </button>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {user.role !== UserRole.ADMIN && (
                            <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Xóa</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'links' && (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Slug</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Original URL</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Người tạo</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Clicks</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Delete</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {links.map((link) => (
                      <tr key={link.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-indigo-600 font-medium">{link.slug}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={link.originalUrl}>{link.originalUrl}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {link.creatorId === 'guest' ? 'Khách' : (users.find(u => u.id === link.creatorId)?.name || 'Unknown')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{link.clicks}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button onClick={() => handleSimulateVisit(link.slug)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded">Visit</button>
                          <button onClick={() => handleDeleteLink(link.id)} className="ml-2 text-red-600 hover:text-red-900">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;