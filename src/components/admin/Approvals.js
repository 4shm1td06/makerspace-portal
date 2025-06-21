import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';

const Approvals = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, description, owner_id, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch pending projects');
      console.error(error);
    } else {
      setProjects(data);
    }

    setLoading(false);
  };

  const handleDecision = async (id, status) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('projects')
      .update({
        status,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update project status');
      console.error(error);
    } else {
      toast.success(`Project ${status}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  if (loading) return <div className="p-4">Loading pending projects...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Project Approvals</h1>

      {projects.length === 0 ? (
        <p>No pending project requests.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{project.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted at: {new Date(project.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecision(project.id, 'active')}
                    className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(project.id, 'rejected')}
                    className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;
