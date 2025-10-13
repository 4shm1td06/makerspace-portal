// src/components/admin/AdminProjects.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [ownerNameById, setOwnerNameById] = useState({}); // { [owner_id]: "Owner Name" }
  const [loading, setLoading] = useState(true);

  const fetchProjectsAndOwners = async () => {
    setLoading(true);

    // 1) Fetch projects (include owner_id and owner_name)
    const { data: projData, error: projErr } = await supabase
      .from('projects')
      .select('id, title, status, owner_id, owner_name, created_at')
      .order('created_at', { ascending: false });

    if (projErr) {
      console.error(projErr);
      toast.error('Failed to load projects');
      setProjects([]);
      setOwnerNameById({});
      setLoading(false);
      return;
    }

    const rows = projData || [];
    setProjects(rows);

    // 2) Collect unique owner_ids
    const ownerIds = Array.from(new Set(rows.map(r => r.owner_id).filter(Boolean)));
    if (ownerIds.length === 0) {
      setOwnerNameById({});
      setLoading(false);
      return;
    }

    // 3) Fetch names from profiles (schema you shared: profiles.id is auth.users.id)
    const { data: profData, error: profErr } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', ownerIds);

    if (profErr) {
      console.warn('Could not fetch profiles:', profErr);
      setOwnerNameById({});
      setLoading(false);
      return;
    }

    // 4) Build owner_id -> display name map
    const byId = {};
    for (const p of profData || []) {
      const display =
        (p.name && p.name.trim()) ||
        (p.email && p.email.trim()) ||
        (p.id ? `User ${p.id.slice(0, 8)}` : 'Unknown');
      byId[p.id] = display;
    }

    setOwnerNameById(byId);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectsAndOwners();
  }, []);

  if (loading) return <div>Loading projects...</div>;
  if (!projects || projects.length === 0) return <div>No projects found</div>;

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
          {projects.map(({ id, title, status, owner_id, owner_name, created_at }) => {
            // Prefer projects.owner_name if present (you said it's null now, but we'll keep it for future)
            const displayOwner =
              (owner_name && owner_name.trim()) ||
              ownerNameById[owner_id] ||
              (owner_id ? `User ${String(owner_id).slice(0, 8)}` : 'Unknown');

            return (
              <tr key={id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="border border-gray-300 dark:border-gray-600 p-2">{title}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">{displayOwner}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 capitalize">{status}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">
                  {created_at ? new Date(created_at).toLocaleString() : '—'}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 space-x-2 text-center">
                  <button
                    onClick={() => alert(`View or manage project ID: ${id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
                  >
                    Expand
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProjects;
