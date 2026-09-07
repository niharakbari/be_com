import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Bell, Trash2, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../api/notificationApi';

export default function Header() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getAll();
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('refreshNotifications', handleRefresh);
    
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefresh);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString();
  };

  const getIcon = (type) => {
    if (type === 'budget_exceeded') return <AlertOctagon size={18} className="text-red-500" />;
    if (type === 'budget_near_limit') return <AlertTriangle size={18} className="text-amber-500" />;
    return <Bell size={18} className="text-btn-primary" />;
  };

  return (
    <header className="flex flex-col xl:flex-row justify-between items-start gap-6 px-4 md:px-8 pt-4 md:pt-10 pb-4">
      <div>
        <h1 className="text-2xl md:text-[32px] font-bold tracking-tight mb-2 text-text-main">Hello, {user?.user_name || 'User'}!</h1>
        <p className="text-sm md:text-base text-text-muted font-medium">All information about your finances in the sections below.</p>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 mt-2 w-full xl:w-auto relative">
        
        {/* Notifications */}
        <div ref={dropdownRef} className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-12 h-12 rounded-full bg-surface border border-border-main flex items-center justify-center text-text-muted hover:text-text-main transition-colors shadow-sm relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface"></span>
            )}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 top-14 w-80 sm:w-96 bg-surface border border-border-main rounded-3xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
               <div className="p-4 border-b border-border-main flex justify-between items-center bg-page">
                 <h3 className="font-bold text-text-main text-lg">Notifications {unreadCount > 0 && <span className="text-sm bg-btn-primary text-btn-text px-2 py-0.5 rounded-full ml-2">{unreadCount} new</span>}</h3>
                 {unreadCount > 0 && (
                   <button onClick={handleMarkAllRead} className="text-xs font-semibold text-text-muted hover:text-text-main transition-colors">
                     Mark all read
                   </button>
                 )}
               </div>
               
               <div className="flex-1 overflow-y-auto">
                 {loading ? (
                   <div className="p-6 text-center text-text-muted text-sm">Loading...</div>
                 ) : notifications.length > 0 ? (
                   <div className="flex flex-col divide-y divide-border-main">
                     {notifications.map(n => (
                       <div key={n.id} className={`p-4 transition-colors hover:bg-page/50 group flex gap-3 ${!n.is_read ? 'bg-page/40' : ''}`}>
                         <div className="shrink-0 mt-1">
                           {getIcon(n.type)}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start mb-1">
                             <p className={`text-sm font-bold truncate pr-2 ${!n.is_read ? 'text-text-main' : 'text-text-muted'}`}>
                               {n.title}
                             </p>
                             <span className="text-[10px] font-semibold text-text-muted whitespace-nowrap">{formatTime(n.created_at)}</span>
                           </div>
                           <p className={`text-xs leading-snug break-words ${!n.is_read ? 'text-text-main/80 font-medium' : 'text-text-muted'}`}>
                             {n.message}
                           </p>
                           
                           <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {!n.is_read && (
                               <button onClick={() => handleMarkRead(n.id)} className="text-[10px] font-bold text-btn-primary flex items-center gap-1 hover:underline">
                                 <CheckCircle size={12} /> Mark read
                               </button>
                             )}
                             <button onClick={() => handleDelete(n.id)} className="text-[10px] font-bold text-red-500 flex items-center gap-1 hover:underline">
                               <Trash2 size={12} /> Delete
                             </button>
                           </div>
                         </div>
                         {!n.is_read && (
                           <div className="shrink-0 w-2 h-2 rounded-full bg-btn-primary self-center"></div>
                         )}
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="p-8 text-center text-text-muted">
                     <Bell size={32} className="mx-auto mb-3 opacity-20" />
                     <p className="text-sm font-medium">No notifications yet.</p>
                     <p className="text-xs mt-1">You're all caught up!</p>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>

        <button 
          onClick={toggleTheme}
          className="w-12 h-12 rounded-full bg-surface border border-border-main flex items-center justify-center text-text-muted hover:text-text-main transition-colors shadow-sm"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <Link to="/profile" className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:ring-2 hover:ring-[var(--color-primary)] transition-all cursor-pointer">
          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.user_name || 'User'}`} alt="Profile" className="w-full h-full object-cover" />
        </Link>
      </div>
    </header>
  );
}
