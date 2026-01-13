import React, { useEffect, useState } from 'react';
import { User, ShortLink, DailyStat } from '../types';
import { getLinksByUser, deleteLink, incrementClick, updateLinkExpiry, getLinkById } from '../services/mockBackend';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import QRCodeModal from '../components/QRCodeModal';
import BulkCreateModal from '../components/BulkCreateModal';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLink, setSelectedLink] = useState<ShortLink | null>(null);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [editingExpiry, setEditingExpiry] = useState<string | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  
  // Modals state
  const [showQRModal, setShowQRModal] = useState<ShortLink | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isGraphReady, setIsGraphReady] = useState(false);

  // Determine if this is a guest session
  const isGuest = !user;

  useEffect(() => {
    loadLinks();
    // Delay rendering chart slightly to allow container layout to calculate
    const timer = setTimeout(() => {
        setIsGraphReady(true);
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadLinks = () => {
    if (user) {
      const userLinks = getLinksByUser(user.id);
      const sorted = userLinks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLinks(sorted);
      if (sorted.length > 0 && !selectedLink) setSelectedLink(sorted[0]);
    } else {
      // Guest logic
      const guestLinkId = localStorage.getItem('guest_link_id');
      if (guestLinkId) {
        const link = getLinkById(guestLinkId);
        if (link) {
          setLinks([link]);
          setSelectedLink(link);
        } else {
          // Link not found (maybe expired and cleaned up)
          localStorage.removeItem('guest_link_id');
          setLinks([]);
        }
      }
    }
  };

  const handleDelete = (id: string) => {
    if (isGuest) {
      if (window.confirm("Bạn có chắc muốn hủy link này? Link sẽ bị xóa vĩnh viễn.")) {
        deleteLink(id);
        localStorage.removeItem('guest_link_id');
        loadLinks();
        setSelectedLink(null);
      }
    } else {
      if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa link này? Hành động này không thể hoàn tác.")) {
        deleteLink(id);
        loadLinks();
        if (selectedLink?.id === id) setSelectedLink(null);
      }
    }
  };

  const handleSimulateVisit = (slug: string) => {
    // Open the local hash URL (e.g. /#/slug) so it goes through RedirectHandler
    const url = `${window.location.origin}/#/${slug}`;
    window.open(url, '_blank');
    // We reload stats after a short delay to allow the redirect handler to process the click
    setTimeout(() => loadLinks(), 1000);
  };

  const handleUpdateExpiry = (linkId: string) => {
    if (!newExpiryDate) {
      // Clear expiry
      updateLinkExpiry(linkId, null);
    } else {
      updateLinkExpiry(linkId, new Date(newExpiryDate).toISOString());
    }
    setEditingExpiry(null);
    loadLinks();
  };

  const filteredLinks = links.filter(link => 
    link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
    link.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter Chart Data based on date range
  const getChartData = (link: ShortLink): DailyStat[] => {
    if (!link.history) return [];
    let data = [...link.history];
    
    if (dateFilter.start) {
      data = data.filter(d => d.date >= dateFilter.start);
    }
    if (dateFilter.end) {
      data = data.filter(d => d.date <= dateFilter.end);
    }
    
    // Sort by date just in case
    return data.sort((a, b) => a.date.localeCompare(b.date));
  };

  const isExpired = (dateStr?: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  // If guest has no links, show empty state or redirect
  if (isGuest && links.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy link khách</h2>
         <p className="mt-2 text-gray-600 dark:text-gray-400">Phiên làm việc của bạn đã hết hạn hoặc bạn chưa tạo link nào.</p>
         <Link to="/" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 font-medium">Tạo link mới &rarr;</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Modals */}
      {showQRModal && (
        <QRCodeModal 
          originalUrl={showQRModal.originalUrl} 
          slug={showQRModal.slug} 
          onClose={() => setShowQRModal(null)} 
        />
      )}
      {showBulkModal && user && (
        <BulkCreateModal
          userId={user.id}
          onSuccess={() => { loadLinks(); }}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isGuest ? 'Quản lý Link Khách (Guest)' : 'Thống kê & Quản lý Link'}
        </h1>
        {isGuest && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 md:mt-0 max-w-lg dark:bg-yellow-900/30 dark:border-yellow-600">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Đây là phiên khách. Link này sẽ tự động hết hạn và bị xóa sau 24 giờ kể từ khi tạo.
                </p>
              </div>
            </div>
          </div>
        )}
        {!isGuest && (
          <button
            onClick={() => setShowBulkModal(true)}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tạo hàng loạt (CSV)
          </button>
        )}
      </div>
      
      {/* Detail & Chart Section */}
      {selectedLink && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8 border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                Biểu đồ lượt click: <span className="text-indigo-600 dark:text-indigo-400">/{selectedLink.slug}</span>
                {isExpired(selectedLink.expiresAt) && <span className="px-2 py-0.5 rounded text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">Đã hết hạn</span>}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-md">{selectedLink.originalUrl}</p>
            </div>
            
            {/* Date Filter */}
            <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
               <div className="flex items-center gap-1">
                 <label className="text-xs text-gray-500 dark:text-gray-400">Từ:</label>
                 <input 
                   type="date" 
                   className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                   value={dateFilter.start}
                   onChange={e => setDateFilter({...dateFilter, start: e.target.value})}
                 />
               </div>
               <div className="flex items-center gap-1">
                 <label className="text-xs text-gray-500 dark:text-gray-400">Đến:</label>
                 <input 
                   type="date" 
                   className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                   value={dateFilter.end}
                   onChange={e => setDateFilter({...dateFilter, end: e.target.value})}
                 />
               </div>
               <button 
                  onClick={() => setDateFilter({ start: '', end: '' })}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Xóa lọc
               </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {isGraphReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData(selectedLink)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4B5563" opacity={0.3} />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#9CA3AF'}} stroke="#6B7280" />
                  <YAxis tick={{fontSize: 12, fill: '#9CA3AF'}} stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)', color: '#F3F4F6' }}
                    itemStyle={{ color: '#E5E7EB' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} name="Lượt click" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                  Đang tải biểu đồ...
               </div>
            )}
          </div>
          <div className="mt-4 text-center text-xs text-gray-400">
             Hiển thị số liệu theo ngày
          </div>
        </div>
      )}

      {/* Link Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Danh sách Link</h3>
          {!isGuest && (
            <input 
              type="text" 
              placeholder="Tìm kiếm link..." 
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Link rút gọn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">URL Gốc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái / Hết hạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clicks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLinks.length > 0 ? filteredLinks.map((link) => {
                const expired = isExpired(link.expiresAt);
                const isSelected = selectedLink?.id === link.id;
                return (
                <tr 
                  key={link.id} 
                  className={`cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`} 
                  onClick={() => setSelectedLink(link)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">shrt.ai/{link.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-200 truncate max-w-xs" title={link.originalUrl}>{link.originalUrl}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={e => e.stopPropagation()}>
                    {editingExpiry === link.id ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="datetime-local" 
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          defaultValue={link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setNewExpiryDate(e.target.value)}
                        />
                        <button onClick={() => handleUpdateExpiry(link.id)} className="text-green-600 dark:text-green-400 text-xs font-bold">Lưu</button>
                        <button onClick={() => setEditingExpiry(null)} className="text-gray-500 dark:text-gray-400 text-xs">Hủy</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${expired ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                          {expired ? 'Hết hạn' : 'Hoạt động'}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                           {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : 'Vô thời hạn'}
                        </div>
                        <button 
                          onClick={() => {
                            setEditingExpiry(link.id);
                            setNewExpiryDate(link.expiresAt || '');
                          }}
                          className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="Chỉnh sửa ngày hết hạn"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {link.clicks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => setShowQRModal(link)}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded transition-colors"
                      title="Mã QR"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zm-6 0H6.414a1 1 0 00-.707.293L2.828 17.828A1 1 0 002.828 19.243L5.586 22H8a1 1 0 001-1v-4zm2 0h2v4h-2v-4zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" />
                        <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                        <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                        <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleSimulateVisit(link.slug)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded transition-colors"
                    >
                      Visit
                    </button>
                    <button 
                      onClick={() => handleDelete(link.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              )}) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Bạn chưa có link nào. Hãy tạo link mới!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;