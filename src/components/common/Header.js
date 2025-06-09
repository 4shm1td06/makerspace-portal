import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  Search,
  Sun,
  Moon,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext'; // Make sure path is correct

const Header = ({ onSidebarToggle, darkMode, setDarkMode }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const { notifications, unreadCount, markAsRead } = useNotifications();

  const fetchProfile = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error) {
      setProfile(data);
    } else {
      console.error('Error fetching profile:', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowNotification(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = profile?.name || 'User';
  const userRole = profile?.membership_type || 'Member';
  const avatarUrl = profile?.avatar_url;

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Open Menu"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg dark:bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              MakerSpace Portal
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search projects, inventory, members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Right: Notifications and User Menu */}
        <div className="flex items-center space-x-4 relative" ref={menuRef}>
          {/* 🔔 Notification Button */}
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* 🔽 Notification Dropdown */}
          {showNotification && (
            <div className="absolute right-12 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-white">
                Notifications
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <li className="p-4 text-gray-500 dark:text-gray-400 text-sm text-center">
                    No notifications
                  </li>
                )}
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      n.is_read ? 'text-gray-500' : 'font-medium text-gray-900 dark:text-white'
                    }`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{n.message}</span>
                      {!n.is_read && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 👤 User Menu */}
          <div>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="User menu"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                {userName}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
                  </div>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </button>

                  <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>

                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {darkMode ? (
                      <>
                        <Sun className="h-4 w-4 mr-3" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-3" />
                        Dark Mode
                      </>
                    )}
                  </button>

                  <hr className="my-1 border-gray-200 dark:border-gray-700" />

                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:hover:bg-red-950 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
