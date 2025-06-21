import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import {
  Users,
  BarChart,
  CheckCircle,
  FolderKanban,
} from 'lucide-react';
import { motion } from 'framer-motion';

const cardData = [
  {
    title: 'Total Users',
    icon: Users,
    key: 'totalUsers',
    bgColor: 'bg-blue-200 dark:bg-blue-800/30',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  {
    title: 'Total Projects',
    icon: FolderKanban,
    key: 'totalProjects',
    bgColor: 'bg-green-200 dark:bg-green-800/30',
    textColor: 'text-green-700 dark:text-green-400',
  },
  {
    title: 'Approved Projects',
    icon: CheckCircle,
    key: 'approvedProjects',
    bgColor: 'bg-emerald-200 dark:bg-emerald-800/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    title: 'Pending Approvals',
    icon: BarChart,
    key: 'pendingProjects',
    bgColor: 'bg-yellow-200 dark:bg-yellow-800/30',
    textColor: 'text-yellow-700 dark:text-yellow-400',
  },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    approvedProjects: 0,
    pendingProjects: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: totalUsers },
          { count: totalProjects },
          { count: approvedProjects },
          { count: pendingProjects },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        setStats({
          totalUsers: totalUsers || 0,
          totalProjects: totalProjects || 0,
          approvedProjects: approvedProjects || 0,
          pendingProjects: pendingProjects || 0,
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load stats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading admin dashboard...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map(({ title, icon: Icon, key, bgColor, textColor }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 flex items-center gap-4 border border-gray-200 dark:border-gray-800 transition-all"
          >
            <div className={`p-3 rounded-full ${bgColor} ${textColor}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {stats[key]}
              </h2>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
