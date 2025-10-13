// src/components/admin/AdminProjects.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [ownerNameById, setOwnerNameById] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState(null);
  const navigate = useNavigate();

  const fetchProjectsAndOwners = async () => {
    setLoading(true);
    setLastError(null);

    // 1) Fetch projects (schema-proof)
    const { data: projData, error: projErr, status: projStatus } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projErr) {
      console.error('[projects] error', projErr, 'status', projStatus);
      setLastError(projErr.message || `Failed to load projects (HTTP ${projStatus || '—'})`);
      toast.error('Failed to load projects');
      setProjects([]);
      setOwnerNameById({});
      setLoading(false);
      return;
    }

    const rows = projData || [];
    setProjects(rows);

    // 2) Owner name map from profiles
    const ownerIds = Array.from(new Set(rows.map(r => r.owner_id).filter(Boolean)));
    if (ownerIds.length === 0) {
      setOwnerNameById({});
      setLoading(false);
      return;
    }

    const { data: profData, error: profErr, status: profStatus } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', ownerIds);

    if (profErr) {
      console.warn('[profiles] error', profErr, 'status', profStatus);
      // Don’t block the page if profiles fails — fallback to UUIDs
      setOwnerNameById({});
      setLoading(false);
      return;
    }

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

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">All Projects</h2>

      {/* Show any Supabase error plainly */}
      {lastError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-800 p-3 text-sm">
          {lastError}
          <button
            onClick={fetchProjectsAndOwners}
            className="ml-3 inline-block rounded bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {loading && <div>Loading projects...</div>}

      {!loading && !lastError && (!projects || projects.length === 0) && (
        <div>No projects found</div>
      )}

      {!loading && !lastError && projects && projects.length > 0 && (
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
              const displayOwner =
                (owner_name && String(owner_name).trim()) ||
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
                      onClick={() => navigate(`/admin/adminprojects/${id}`)}
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
      )}
    </div>
  );
};

export default AdminProjects;