import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Activity,
  Download,
  LogOut,
  Menu,
  X,
  Bell,
  Users,
  Settings,
  ShieldCheck,
  GraduationCap,
  Lock
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { adminRepo } from '../../repositories';
import { NotificationItem } from '../../api/mockDb';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await adminRepo.getNotifications();
      setNotifications(res.notifications);
    } catch (e) {
      console.warn('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 10 seconds for real-time simulation
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminRepo.markNotificationRead(id);
      fetchNotifications();
    } catch (e) {
      console.warn('Failed to mark notification as read');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getSidebarLinks = () => {
    if (user?.role === 'student') {
      return [
        { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/student' },
        { label: 'Biodata Form', icon: <FileText className="w-5 h-5" />, path: '/student/biodata' },
        { label: 'Submission Status', icon: <Activity className="w-5 h-5" />, path: '/student/status' },
        { label: 'Change Password', icon: <Lock className="w-5 h-5" />, path: '/change-password' },
      ];
    } else {
      // Reviewer and Super Admin share /admin main routing
      return [
        { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' },
        { label: 'Change Password', icon: <Lock className="w-5 h-5" />, path: '/change-password' },
      ];
    }
  };

  const links = getSidebarLinks();

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0">
        {/* Header Institution */}
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 font-sans leading-tight">
              College
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Biodata Portal
            </p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-premium'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card Info & Logout */}
        <div className="p-4 border-t border-slate-50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user?.firstName?.charAt(0) || user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {user?.regNumber || (user?.role === 'super_admin' ? 'Super Admin' : 'Reviewer')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-64 max-w-xs bg-white h-full flex flex-col z-10 border-r border-slate-100"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xs font-bold text-slate-800">College</h1>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Biodata</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                        ${
                          isActive
                            ? 'bg-brand-primary text-white shadow-premium'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }
                      `}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-50 space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {user?.firstName?.charAt(0) || user?.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {user?.regNumber || (user?.role === 'super_admin' ? 'Super Admin' : 'Reviewer')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm md:text-base font-bold text-slate-800 font-sans capitalize">
              {location.pathname === '/student' && 'Student Dashboard'}
              {location.pathname === '/student/biodata' && 'Biodata Form'}
              {location.pathname === '/student/status' && 'Submission Status'}
              {location.pathname === '/admin' && (user?.role === 'super_admin' ? 'Super Admin Dashboard' : 'Reviewer Dashboard')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Alert Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 relative transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    {/* Click outside backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-premium z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Portal Notifications
                        </h4>
                        <span className="text-[10px] bg-teal-50 text-brand-primary px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} New
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleMarkAsRead(notif.id)}
                              className={`p-4 text-left cursor-pointer transition-colors hover:bg-slate-50 flex flex-col gap-1
                                ${!notif.read ? 'bg-slate-50/50 border-l-2 border-brand-primary' : ''}
                              `}
                            >
                              <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                              <p className="text-[11px] text-slate-500 leading-normal">{notif.message}</p>
                              <span className="text-[9px] text-slate-400 font-medium">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(notif.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Widget */}
            <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-primary flex items-center justify-center font-bold text-xs">
                {user?.firstName?.charAt(0) || user?.email.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'reviewer' ? 'Reviewer' : 'Student'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Inner Content Container */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
