import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart,
  Box,
  CheckCircle,
  Clipboard,
  Calendar,
  LogOut,
  Settings,
  Boxes,
  Newspaper,
  Menu,
  X,
  ChevronDown,
  Wrench,
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const navItems = [
  { label: 'Member Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
  { label: 'Admin Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin/dashboard' },
  { label: 'Users', icon: <Users size={18} />, path: '/admin/users' },
  { label: 'Projects', icon: <Boxes size={18} />, path: '/projects' },
  { label: 'Project List', icon: <Clipboard size={18} />, path: '/admin/adminprojects' },
  { label: 'Inventory', icon: <Box size={18} />, path: '/inventory' },
  { label: 'Inventory Management', icon: <Box size={18} />, path: '/admin/inventory' },
  { label: 'Analytics', icon: <BarChart size={18} />, path: '/admin/analytics' },
  { label: 'Approvals', icon: <CheckCircle size={18} />, path: '/admin/approvals' },
  { label: 'Event Calendar', icon: <Calendar size={18} />, path: '/admin/events' },
  { label: 'Newspaper', icon: <Newspaper size={18} />, path: '/admin/news' },
  { label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
];

const AdminSidebar = ({ isOpen, onClose, collapsed }) => {
  const [toolsExpanded, setToolsExpanded] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 z-40 h-full bg-white dark:bg-gray-900 border-r dark:border-gray-800 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'w-16' : 'w-64'} md:translate-x-0`}
      >
        <div className="flex flex-col h-full p-2">
          {/* Header */}
          <div className="flex items-center justify-between md:justify-center py-4 px-4">
            <div className="text-lg font-bold text-primary dark:text-white">
              {collapsed ? 'ADM' : 'Admin Panel'}
            </div>
            <button className="md:hidden" onClick={onClose} aria-label="Close sidebar">
              <X className="text-gray-700 dark:text-gray-300" size={20} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 mt-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-red-700/20 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}

            {/* Tools Expandable Menu */}
            <div>
              <button
                onClick={() => setToolsExpanded(!toolsExpanded)}
                className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wrench size={18} />
                  {!collapsed && <span>Tools</span>}
                </div>
                {!collapsed && (
                  <ChevronDown
                    className={`transform transition-transform ${
                      toolsExpanded ? 'rotate-180' : ''
                    }`}
                    size={18}
                  />
                )}
              </button>
              {toolsExpanded && !collapsed && (
                <div className="pl-10 mt-1 space-y-1">
                  <NavLink
                    to="/admin/LiveUsersList"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block px-2 py-1 rounded-md text-sm ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-red-700/20 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    Live Users
                  </NavLink>
                  <NavLink
                    to="/admin/tools/logs"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block px-2 py-1 rounded-md text-sm ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-red-700/20 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    System Logs
                  </NavLink>
                  <NavLink
                    to="/admin/tools/db"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block px-2 py-1 rounded-md text-sm ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-red-700/20 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    DB Explorer
                  </NavLink>
                </div>
              )}
            </div>
          </nav>

          {/* Logout */}
          <button
            onClick={() => {
              handleLogout();
              sessionStorage.removeItem('tools_access');
            }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors mt-4"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

// Sidebar toggle button
export const SidebarToggleButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="md:hidden p-2 text-gray-700 dark:text-white"
    aria-label="Toggle sidebar"
  >
    <Menu size={24} />
  </button>
);

export default AdminSidebar;
