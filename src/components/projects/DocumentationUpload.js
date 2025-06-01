import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

const DocumentationUpload = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [docUrl, setDocUrl] = useState('');
  const [selectedId, setSelectedId] = useState('');

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
    const { error } = await supabase
      .from('projects')
      .update({ documentation_urls: [docUrl] })
      .eq('id', selectedId);

    if (error) alert('Error: ' + error.message);
    else alert('Documentation added');
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Add Documentation URL</h2>
      <form onSubmit={submitDoc} className="space-y-3">
        <select onChange={e => setSelectedId(e.target.value)} className="input">
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <input
          type="url"
          placeholder="https://link.to/documentation"
          value={docUrl}
          onChange={(e) => setDocUrl(e.target.value)}
          className="input"
          required
        />
        <button type="submit" className="btn-primary w-full">Attach URL</button>
      </form>
    </div>
  );
};

export default DocumentationUpload;
