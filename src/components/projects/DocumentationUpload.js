import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

const DocumentationUpload = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [docUrl, setDocUrl] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  useEffect(() => {
    if (!user) return;
    supabase
      .from('projects')
      .select('id, title')
      .eq('owner_id', user.id)
      .then(({ data }) => setProjects(data || []));
  }, [user]);

  const submitDoc = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await supabase
      .from('projects')
      .update({ documentation_urls: [docUrl] })
      .eq('id', selectedId);

    setLoading(false);

    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setStatus({ type: 'success', message: 'Documentation URL attached successfully!' });
      setDocUrl('');
      setSelectedId('');
    }
  };

  return (
    <div className="card max-w-md mx-auto mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Add Documentation URL
      </h2>
      <form onSubmit={submitDoc} className="space-y-4">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <input
          type="url"
          placeholder="https://link.to/documentation"
          value={docUrl}
          onChange={(e) => setDocUrl(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex justify-center items-center transition disabled:opacity-60"
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          )}
          {loading ? 'Attaching...' : 'Attach URL'}
        </button>

        {status && (
          <p
            className={`text-sm ${
              status.type === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
};

export default DocumentationUpload;
