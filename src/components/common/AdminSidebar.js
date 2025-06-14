import React from 'react';
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
  { label: 'Event Calendar', icon: <Calendar size={18} />, path: '/admin/calendar' },
  { label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
];

const AdminSidebar = ({ isOpen, onClose, collapsed, darkMode }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <aside
      className={`bg-white dark:bg-gray-900 border-r dark:border-gray-800 transition-all duration-200 h-full ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full p-2">
        <div className="text-center font-bold text-lg py-4 text-primary dark:text-white">
          {collapsed ? 'ADM' : 'Admin Panel'}
        </div>

        <nav className="flex-1 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors mt-auto"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
