import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Home, ClipboardList, Boxes, Calendar, Users, Settings, LogOut, X,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <Home /> },
  { name: 'Projects', path: '/projects', icon: <ClipboardList /> },
  { name: 'Inventory', path: '/inventory', icon: <Boxes /> },
  { name: 'Events', path: '/news-events', icon: <Calendar /> },
  { name: 'Members', path: '/members', icon: <Users />, roles: ['admin'] },
  { name: 'Settings', path: '/settings', icon: <Settings /> },
];

export default function Sidebar({ isOpen, onClose, collapsed }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const userRole = user?.user_metadata?.role || 'member';
  const navigate = useNavigate();
  const isActive = (path) => location.pathname.startsWith(path);
  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );


  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed z-50 top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg dark:shadow-black/50 transform transition-transform duration-200 ease-in-out',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
            'lg:translate-x-0 lg:static lg:shadow-none': true,
          }
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          {/* Changed dark:text-primary-400 (blue) to dark:text-red-400 */}
          <h1 className="text-xl font-bold text-primary-700 dark:text-red-400">
            Makerspace ERP
          </h1>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-2">
          {filteredItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                isActive(item.path)
                  ? 'bg-primary-600 text-white dark:bg-red-600 dark:text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
