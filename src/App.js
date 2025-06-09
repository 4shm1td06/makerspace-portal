import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/auth/ProtectedRoute';

import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import CompleteProfile from './components/auth/CompleteProfile';

import Dashboard from './components/dashboard/Dashboard';
import ProjectsMain from './components/projects/ProjectsMain';
import InventoryMain from './components/inventory/InventoryMain';
import NewsEvents from './components/news-events/NewsEvents';
import SettingsPage from './components/common/SettingsPage';

import './styles/globals.css';

import { NotificationProvider } from './context/NotificationContext';

function App() {
  const location = useLocation();
  const noLayoutRoutes = ['/login', '/register', '/forgot-password', '/complete-profile'];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleSidebarToggle = () => setIsSidebarOpen(!isSidebarOpen);
  const handleCollapseToggle = () => setCollapsed(!collapsed);

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {!hideLayout && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            collapsed={collapsed}
            darkMode={darkMode}
          />
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
              <Route
                path="/complete-profile"
                element={
                  <ProtectedRoute>
                    <CompleteProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectsMain />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <InventoryMain />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news-events"
                element={
                  <ProtectedRoute>
                    <NewsEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                  </ProtectedRoute>
                }
              />
              <Route index element={<Navigate to="/login" />} />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </main>

          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
