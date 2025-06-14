import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { format, isToday, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const ActivityStatus = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [projectList, setProjectList] = useState([]);
  const [lastLogin, setLastLogin] = useState('');
  const [userId, setUserId] = useState(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const loginDate = parseISO(user.last_sign_in_at);
        setLastLogin(isToday(loginDate) ? 'Today' : format(loginDate, 'PPpp'));
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchProjects = async () => {
      const { data, count } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('owner_id', userId);
      setProjectList(data || []);
      setProjectCount(count || 0);
    };

    fetchProjects();

    const channel = supabase
      .channel('realtime:project-count')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `owner_id=eq.${userId}`,
      }, fetchProjects)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -100 || info.offset.x > 100 || Math.abs(info.offset.y) > 100) {
      setFlipped(!flipped);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto my-6 cursor-pointer"
      onClick={() => setFlipped(!flipped)}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-64">
        <AnimatePresence initial={false} mode="wait">
          {!flipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: 180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute inset-0 bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-xl shadow-md backface-hidden"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h2 className="text-xl font-semibold mb-2">Activity Status</h2>
              <p>You're active in {projectCount} project(s).</p>
              <p>Last login: {lastLogin}</p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Click or swipe to view projects</p>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: -180 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: -180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute inset-0 bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-xl shadow-md backface-hidden"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h2 className="text-xl font-semibold mb-2">Your Projects</h2>
              <motion.ul
                className="space-y-2 max-h-48 overflow-y-auto pr-1"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {projectList.map((project) => (
                  <motion.li
                    key={project.id}
                    variants={itemVariants}
                    className="border-b border-gray-200 dark:border-gray-700 pb-1"
                  >
                    <strong>{project.title}</strong>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                  </motion.li>
                ))}
              </motion.ul>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Click or swipe to go back</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ActivityStatus;
