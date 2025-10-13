import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { supabase } from './services/supabase';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import AdminSidebar from './components/common/AdminSidebar';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import CompleteProfile from './components/auth/CompleteProfile';

import Dashboard from './components/dashboard/Dashboard';
import ProjectsMain from './components/projects/ProjectsMain';
import InventoryMain from './components/inventory/InventoryMain';
import NewsEvents from './components/news-events/NewsEvents';
import ReminderCalendar from './components/news-events/ReminderCalendar';
import SettingsPage from './components/common/SettingsPage';

import AdminDashboard from './components/admin/Dashboard';
import Users from './components/admin/Users';
import Analytics from './components/admin/Analytics';
import Approvals from './components/admin/Approvals';
import AdminProjects from './components/admin/AdminProjects';
import AdminInventory from './components/admin/AdminInventory';
import Events from './components/admin/Events';
import News from './components/admin/news';
import LiveUsersList from './components/admin/LiveUsersList';

import './styles/globals.css';
import { NotificationProvider } from './context/NotificationContext';
import ToolsProtectedRoute from './components/admin/ToolsProtectedRoute';

import MeetingRoom from './components/meeting/MeetingRoom';
import AdminProjectDetail from './components/admin/AdminProjectDetail';


function App() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const noLayoutRoutes = ['/login', '/register', '/forgot-password', '/complete-profile'];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (!error && data) setRole(data.role);
      }
      setRoleLoading(false);
    };
    fetchRole();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const updateLastSeen = async () => {
      await supabase.from('presence').upsert({
        user_id: user.id,
        username: user.email,
        last_seen: new Date().toISOString(),
      });
    };

    updateLastSeen();
    const heartbeat = setInterval(updateLastSeen, 15000);

    const fetchOnlineUsers = async () => {
      const THRESHOLD = 30000;
      const { data } = await supabase.from('presence').select('*');
      const now = Date.now();
      const filtered = data.filter(u => new Date(u.last_seen).getTime() > now - THRESHOLD);
      setOnlineUsers(filtered);
    };

    fetchOnlineUsers();
    const channel = supabase
      .channel('presence-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presence' }, fetchOnlineUsers)
      .subscribe();

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSidebarToggle = () => setIsSidebarOpen(!isSidebarOpen);
  const handleCollapseToggle = () => setCollapsed(!collapsed);

  if (loading || (user && roleLoading)) {
    return <div className="h-screen flex items-center justify-center text-gray-700 dark:text-white">Loading...</div>;
  }

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {!hideLayout && (
          role === 'admin' ? (
            <AdminSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              collapsed={collapsed}
              darkMode={darkMode}
            />
          ) : (
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              collapsed={collapsed}
              darkMode={darkMode}
            />
          )
        )}

        <div className="flex flex-col flex-1">
          {!hideLayout && (
            <Header
              onSidebarToggle={handleSidebarToggle}
              collapsed={collapsed}
              onCollapseToggle={handleCollapseToggle}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          )}

          <main className="flex-1 overflow-y-auto p-4 text-gray-900 dark:text-white">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><ProjectsMain /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><InventoryMain /></ProtectedRoute>} />
              <Route path="/reminders" element={<ProtectedRoute><ReminderCalendar /></ProtectedRoute>} />
              <Route path="/news-events" element={<ProtectedRoute><NewsEvents /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><Users /></ProtectedRoute>} />
              <Route path="/admin/adminprojects" element={<ProtectedRoute requireAdmin={true}><AdminProjects /></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute requireAdmin={true}><AdminInventory /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin={true}><Analytics /></ProtectedRoute>} />
              <Route path="/admin/approvals" element={<ProtectedRoute requireAdmin={true}><Approvals /></ProtectedRoute>} />
              <Route path="/admin/events" element={<ProtectedRoute requireAdmin={true}><Events /></ProtectedRoute>} />
              <Route path="/admin/news" element={<ProtectedRoute requireAdmin={true}><News /></ProtectedRoute>} />
              <Route path="/admin/liveuserslist" element={<ProtectedRoute requireAdmin={true}><ToolsProtectedRoute><LiveUsersList onlineUsers={onlineUsers} /></ToolsProtectedRoute></ProtectedRoute>} />

              <Route path="/meeting/:roomId" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />

              <Route index element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to={user ? (role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login'} replace />} />
              <Route path="/admin/adminprojects/:id" element={<ProtectedRoute requireAdmin={true}> <AdminProjectDetail /> </ProtectedRoute>}/>
            </Routes>
          </main>

          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
