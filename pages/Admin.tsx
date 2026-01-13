import React, { useEffect, useState } from 'react';
import { User, ShortLink, UserRole } from '../types';
import { 
    getAllUsers, getAllLinks, deleteUser, deleteLink, updateLink, 
    updateFullUser, adminCreateUser 
} from '../services/mockBackend';

interface AdminProps {
  currentUser: User;
}

const USERS_PER_PAGE = 10;
const LINKS_PER_PAGE = 20;

const Admin: React.FC<AdminProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'links'>('users');
  const [showCreateUser, setShowCreateUser] = useState(false);

  // Search State
  const [linkSearchTerm, setLinkSearchTerm] = useState('');

  // Pagination State
  const [userPage, setUserPage] = useState(1);
  const [linkPage, setLinkPage] = useState(1);

  // Edit State (Links)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkForm, setEditLinkForm] = useState({ slug: '', originalUrl: '' });

  // Edit State (Users)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', role: UserRole.USER, password: '' });

  // Create User State
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: UserRole.USER });

  const isOwner = currentUser.role === UserRole.OWNER;
  const isAdmin = currentUser.role === UserRole.ADMIN;

  useEffect(() => {
    refreshData();
  }, []);

  // Reset link page when search changes
  useEffect(() => {
    setLinkPage(1);
  }, [linkSearchTerm]);

  const refreshData = () => {
    setUsers(getAllUsers());
    setLinks(getAllLinks());
  };

  // --- Create User Logic ---
  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await adminCreateUser(newUserForm.email, newUserForm.password, newUserForm.name, newUserForm.role);
          alert(`Đã tạo người dùng ${newUserForm.name} thành công!`);
          setShowCreateUser(false);
          setNewUserForm({ name: '', email: '', password: '', role: UserRole.USER });
          refreshData();
      } catch (error: any) {
          alert(error.message);
      }
  };

  // --- User Logic ---
  const canEditUser = (targetUser: User) => {
      if (isOwner) return targetUser.id !== currentUser.id; // Owner edits everyone else
      if (isAdmin) return targetUser.role === UserRole.USER; // Admin edits User only
      return false;
  };

  const canDeleteUser = (targetUser: User) => {
      if (isOwner) return targetUser.id !== currentUser.id;
      if (isAdmin) return targetUser.role === UserRole.USER;
      return false;
  };

  const startEditingUser = (user: User) => {
      setEditingUserId(user.id);
      setEditUserForm({
          name: user.name,
          email: user.email,
          role: user.role,
          password: '' // Empty by default
      });
  };

  const cancelEditingUser = () => {
      setEditingUserId(null);
      setEditUserForm({ name: '', email: '', role: UserRole.USER, password: '' });
  };

  const saveEditingUser = (userId: string) => {
      if (!window.confirm("Bạn có chắc chắn muốn lưu các thay đổi cho người dùng này?")) return;
      try {
          updateFullUser(userId, {
              name: editUserForm.name,
              email: editUserForm.email,
              role: editUserForm.role,
              password: editUserForm.password // Only processed if not empty and isOwner in backend
          });
          if (isOwner) alert("Cập nhật thông tin người dùng thành công!");
          setEditingUserId(null);
          refreshData();
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleDeleteUser = (targetUser: User) => {
    if (window.confirm(`CẢNH BÁO QUAN TRỌNG:\nBạn sắp xóa người dùng "${targetUser.name}" và TOÀN BỘ link của họ.\nHành động này không thể hoàn tác.\n\nBạn có chắc chắn muốn tiếp tục?`)) {
      deleteUser(targetUser.id);
      if (isOwner) alert("Đã xóa người dùng thành công!");
      refreshData();
    }
  };

  // --- Link Logic ---
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

  const startEditingLink = (link: ShortLink) => {
    setEditingLinkId(link.id);
    setEditLinkForm({ slug: link.slug, originalUrl: link.originalUrl });
  };

  const cancelEditingLink = () => {
    setEditingLinkId(null);
    setEditLinkForm({ slug: '', originalUrl: '' });
  };

  const saveEditingLink = (linkId: string) => {
    if (!window.confirm("Bạn có chắc muốn lưu thay đổi này?")) return;

    try {
        updateLink(linkId, editLinkForm.slug, editLinkForm.originalUrl);
        setEditingLinkId(null);
        refreshData();
    } catch (error: any) {
        alert(error.message);
    }
  };

  // --- Pagination & Filtering Helpers ---

  // Users
  const totalUserPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE
  );

  // Links (Filter then Paginate)
  const filteredLinks = links.filter(l => 
    l.slug.toLowerCase().includes(linkSearchTerm.toLowerCase()) || 
    l.originalUrl.toLowerCase().includes(linkSearchTerm.toLowerCase())
  );
  const totalLinkPages = Math.ceil(filteredLinks.length / LINKS_PER_PAGE);
  const paginatedLinks = filteredLinks.slice(
    (linkPage - 1) * LINKS_PER_PAGE,
    linkPage * LINKS_PER_PAGE
  );


  if (currentUser.role === UserRole.USER) {
    return <div className="p-10 text-center text-red-600 dark:text-red-400">Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trang Quản Trị</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
             Xin chào, <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentUser.role}</span> {currentUser.name}.
             Quản lý người dùng và hệ thống.
          </p>
        </div>
        {/* Create User Button for Owner/Admin */}
        {activeTab === 'users' && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                    onClick={() => setShowCreateUser(!showCreateUser)}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none transition-colors"
                >
                    {showCreateUser ? 'Hủy tạo mới' : 'Thêm người dùng'}
                </button>
            </div>
        )}
      </div>

      <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`${activeTab === 'users' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Người dùng ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`${activeTab === 'links' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Tất cả Links ({links.length})
          </button>
        </nav>
      </div>

      <div className="mt-8 flex flex-col">
        {/* Create User Form */}
        {showCreateUser && activeTab === 'users' && (
            <div className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Tạo tài khoản mới</h3>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên hiển thị</label>
                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</label>
                        <input type="password" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vai trò</label>
                        <select className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value as UserRole})}>
                            <option value={UserRole.USER}>User</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                            {isOwner && <option value={UserRole.OWNER}>Owner</option>}
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Xác nhận tạo</button>
                    </div>
                </form>
            </div>
        )}

        {/* Search Bar for Links */}
        {activeTab === 'links' && (
            <div className="mb-4">
                <input 
                    type="text"
                    placeholder="Tìm kiếm theo Slug hoặc URL..."
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    value={linkSearchTerm}
                    onChange={(e) => setLinkSearchTerm(e.target.value)}
                />
            </div>
        )}

        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg border border-gray-200 dark:border-gray-700">
              
              {/* USERS TABLE */}
              {activeTab === 'users' && (
                <>
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Tên</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Email</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Vai trò</th>
                      {isOwner && <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Mật khẩu</th>}
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {paginatedUsers.map((user) => {
                      const isEditing = editingUserId === user.id;
                      return (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {isEditing ? (
                            <>
                                <td className="px-3 py-4">
                                    <input type="text" className="w-full border border-gray-300 dark:border-gray-600 p-1 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={editUserForm.name} onChange={e => setEditUserForm({...editUserForm, name: e.target.value})} />
                                </td>
                                <td className="px-3 py-4">
                                    <input type="email" className="w-full border border-gray-300 dark:border-gray-600 p-1 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={editUserForm.email} onChange={e => setEditUserForm({...editUserForm, email: e.target.value})} />
                                </td>
                                <td className="px-3 py-4">
                                    <select className="w-full border border-gray-300 dark:border-gray-600 p-1 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={editUserForm.role} onChange={e => setEditUserForm({...editUserForm, role: e.target.value as UserRole})}>
                                        <option value={UserRole.USER}>User</option>
                                        <option value={UserRole.ADMIN}>Admin</option>
                                        {isOwner && <option value={UserRole.OWNER}>Owner</option>}
                                    </select>
                                </td>
                                {isOwner && (
                                    <td className="px-3 py-4">
                                        <input 
                                            type="password" 
                                            className="w-full border border-gray-300 dark:border-gray-600 p-1 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                            placeholder="Để trống nếu không đổi"
                                            value={editUserForm.password}
                                            onChange={e => setEditUserForm({...editUserForm, password: e.target.value})}
                                        />
                                    </td>
                                )}
                            </>
                        ) : (
                            <>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">{user.name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      user.role === UserRole.OWNER ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' : 
                                      user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                {isOwner && <td className="px-3 py-4 text-sm text-gray-400">******</td>}
                            </>
                        )}

                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                          {isEditing ? (
                              <>
                                <button onClick={() => saveEditingUser(user.id)} className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">Lưu</button>
                                <button onClick={cancelEditingUser} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Hủy</button>
                              </>
                          ) : (
                              <>
                                {canEditUser(user) && (
                                    <button onClick={() => startEditingUser(user)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">Sửa</button>
                                )}
                                {canDeleteUser(user) && (
                                    <button onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">Xóa</button>
                                )}
                              </>
                          )}
                        </td>
                      </tr>
                    )})}
                    {paginatedUsers.length === 0 && (
                        <tr><td colSpan={isOwner ? 5 : 4} className="text-center py-4 text-gray-500 dark:text-gray-400">Không có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
                
                {/* User Pagination */}
                {totalUserPages > 1 && (
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">Trước</button>
                            <button onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">Sau</button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Trang <span className="font-medium">{userPage}</span> / <span className="font-medium">{totalUserPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                                        <span className="sr-only">Trước</span>
                                        &larr;
                                    </button>
                                    <button onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                                        <span className="sr-only">Sau</span>
                                        &rarr;
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
                </>
              )}

              {/* LINKS TABLE */}
              {activeTab === 'links' && (
                <>
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 w-1/6">Slug</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 w-1/3">Original URL</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 w-1/6">Người tạo</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 w-1/12">Clicks</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {paginatedLinks.map((link) => {
                      const isEditing = editingLinkId === link.id;
                      return (
                      <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {isEditing ? (
                            <>
                                <td className="px-3 py-4">
                                    <input 
                                        type="text" 
                                        className="w-full border-gray-300 dark:border-gray-600 rounded-md text-sm p-1 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                        value={editLinkForm.slug}
                                        onChange={e => setEditLinkForm({...editLinkForm, slug: e.target.value})}
                                    />
                                </td>
                                <td className="px-3 py-4">
                                    <input 
                                        type="text" 
                                        className="w-full border-gray-300 dark:border-gray-600 rounded-md text-sm p-1 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                        value={editLinkForm.originalUrl}
                                        onChange={e => setEditLinkForm({...editLinkForm, originalUrl: e.target.value})}
                                    />
                                </td>
                            </>
                        ) : (
                            <>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-indigo-600 dark:text-indigo-400 font-medium">{link.slug}</td>
                                <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={link.originalUrl}>{link.originalUrl}</td>
                            </>
                        )}
                        
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {link.creatorId === 'guest' ? 'Khách' : (users.find(u => u.id === link.creatorId)?.name || 'Unknown')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{link.clicks}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                           {isEditing ? (
                               <>
                                <button onClick={() => saveEditingLink(link.id)} className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 font-medium">Lưu</button>
                                <button onClick={cancelEditingLink} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Hủy</button>
                               </>
                           ) : (
                               <>
                                <button onClick={() => startEditingLink(link)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">Sửa</button>
                                <button onClick={() => handleSimulateVisit(link.slug)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">Visit</button>
                                <button onClick={() => handleDeleteLink(link.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">Xóa</button>
                               </>
                           )}
                        </td>
                      </tr>
                    )})}
                    {paginatedLinks.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">Không tìm thấy link nào</td></tr>
                    )}
                  </tbody>
                </table>

                {/* Link Pagination */}
                {totalLinkPages > 1 && (
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button onClick={() => setLinkPage(p => Math.max(1, p - 1))} disabled={linkPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">Trước</button>
                            <button onClick={() => setLinkPage(p => Math.min(totalLinkPages, p + 1))} disabled={linkPage === totalLinkPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">Sau</button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Trang <span className="font-medium">{linkPage}</span> / <span className="font-medium">{totalLinkPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button onClick={() => setLinkPage(p => Math.max(1, p - 1))} disabled={linkPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                                        <span className="sr-only">Trước</span>
                                        &larr;
                                    </button>
                                    <button onClick={() => setLinkPage(p => Math.min(totalLinkPages, p + 1))} disabled={linkPage === totalLinkPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                                        <span className="sr-only">Sau</span>
                                        &rarr;
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;