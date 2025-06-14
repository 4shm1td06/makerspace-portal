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
    icon: <Users className="w-6 h-6" />,
    key: 'totalUsers',
  },
  {
    title: 'Total Projects',
    icon: <FolderKanban className="w-6 h-6" />,
    key: 'totalProjects',
  },
  {
    title: 'Approved Projects',
    icon: <CheckCircle className="w-6 h-6" />,
    key: 'approvedProjects',
  },
  {
    title: 'Pending Approvals',
    icon: <BarChart className="w-6 h-6" />,
    key: 'pendingProjects',
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ count: totalUsers }, { count: totalProjects }, { count: approvedProjects }, { count: pendingProjects }] = await Promise.all([
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
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading admin dashboard...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Admin Dashboard</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map(({ title, icon, key }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 flex items-center gap-4 border border-gray-200 dark:border-gray-800"
          >
            <div className="p-3 bg-blue-200 dark:bg-red-700/20 text-primary-700 dark:text-red-400 rounded-full">
              {icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{stats[key]}</h2>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
