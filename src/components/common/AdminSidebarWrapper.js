import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

const AdminSidebarWrapper = ({ isOpen, onClose, darkMode }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Load collapse state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when collapsed changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <div className="flex">
      <AdminSidebar
        isOpen={isOpen}
        onClose={onClose}
        collapsed={collapsed}
        darkMode={darkMode}
      />

      {/* Collapse Toggle Button (visible on desktop) */}
      <button
        onClick={toggleCollapse}
        className="hidden md:block p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
        style={{ marginTop: '1rem' }}
      >
        {collapsed ? '➡️' : '⬅️'}
      </button>

      {/* Main content */}
      <div className="flex-1">
        {/* Your routed content goes here */}
      </div>
    </div>
  );
};

export default AdminSidebarWrapper;
