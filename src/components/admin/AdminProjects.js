import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all projects
  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load projects');
      console.error(error);
    } else {
      setProjects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (projects.length === 0) {
    return <div>No projects found</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">All Projects</h2>
      <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Project Name</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Project Owner</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Status</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Created At</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(({ id, title, status, owner_id , created_at }) => (
            <tr key={id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <td className="border border-gray-300 dark:border-gray-600 p-2">{title}</td>
              <td className="border border-gray-300 dark:border-gray-600 p-2 capitalize">{owner_id}</td>
              <td className="border border-gray-300 dark:border-gray-600 p-2 capitalize">{status}</td>
              <td className="border border-gray-300 dark:border-gray-600 p-2">
                {new Date(created_at).toLocaleString()}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-2 space-x-2 text-center">
                <button
                  onClick={() => alert(`View or manage project ID: ${id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
                >
                  Expand
                </button>
                {/* Add more actions like Edit, Delete here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProjects;
