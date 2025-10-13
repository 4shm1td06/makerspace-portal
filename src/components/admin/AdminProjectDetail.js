// src/components/admin/AdminProjectDetail.js
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';

const badge = "inline-block px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 mr-2 mb-2";
const sectionTitle = "text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2";
const fieldRow = "grid grid-cols-12 gap-3 items-start mb-3";
const labelCls = "col-span-3 text-sm text-gray-600 dark:text-gray-300";
const valueCls = "col-span-9 text-sm";

function normalizeList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return String(val).split(',').map(s => s.trim()).filter(Boolean);
}
function normalizeUrlList(val) {
  const arr = normalizeList(val);
  return arr.map(s => s);
}

const AdminProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [nameByUserId, setNameByUserId] = useState({}); // { [uuid]: displayName }
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    setLoading(true);

    // Select everything to avoid column-name drift
    const { data, error, status } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      if (status === 406 || status === 404) setProject(null);
      else toast.error('Failed to load project');
      setLoading(false);
      return;
    }

    setProject(data);

    // Batch resolve names for owner_id and approved_by
    const ids = [data.owner_id, data.approved_by].filter(Boolean);
    if (ids.length) {
      const { data: profiles, error: perr } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', ids);

      if (!perr && profiles) {
        const map = {};
        for (const p of profiles) {
          map[p.id] =
            (p.name && p.name.trim()) ||
            (p.email && p.email.trim()) ||
            (p.id ? `User ${p.id.slice(0, 8)}` : 'Unknown');
        }
        setNameByUserId(map);
      } else if (perr) {
        console.warn('Could not fetch profiles:', perr);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const ownerDisplay = useMemo(() => {
    if (!project) return '';
    return (project.owner_name && project.owner_name.trim())
      || nameByUserId[project.owner_id]
      || (project.owner_id ? `User ${String(project.owner_id).slice(0,8)}` : 'Unknown');
  }, [project, nameByUserId]);

  const approverDisplay = useMemo(() => {
    if (!project) return '';
    const uid = project.approved_by;
    return nameByUserId[uid] || (uid ? `User ${String(uid).slice(0,8)}` : '—');
  }, [project, nameByUserId]);

  if (loading) return <div className="p-4">Loading project...</div>;
  if (!project) return <div className="p-4">Project not found</div>;

  const {
    title,
    description,
    status,
    priority,
    collaborator,          // if DB uses "collaborators", next line covers it
    collaborators,
    tags,
    documentation_urls,
    estimated_completion,
    actual_completion,
    budget,
    material_needed,
    approved_at,
    updated_at,
  } = project;

  const collabDisplay = collaborators ?? collaborator ?? '—';
  const tagList = normalizeList(tags);
  const docList = normalizeUrlList(documentation_urls);

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-3 py-1 rounded"
      >
        ← Back
      </button>

      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{title || 'Untitled Project'}</h1>
        {description && (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {description}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className={sectionTitle}>Project Overview</div>

          <div className={fieldRow}>
            <div className={labelCls}>Owner</div>
            <div className={valueCls}>{ownerDisplay}</div>
          </div>

          <div className={fieldRow}>
            <div className={labelCls}>Status</div>
            <div className={valueCls}><span className={badge}>{status || '—'}</span></div>
          </div>

          <div className={fieldRow}>
            <div className={labelCls}>Priority</div>
            <div className={valueCls}><span className={badge}>{priority || '—'}</span></div>
          </div>

          <div className={fieldRow}>
            <div className={labelCls}>Collaborator(s)</div>
            <div className={valueCls}>{collabDisplay || '—'}</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className={sectionTitle}>Timeline</div>

          <div className={fieldRow}>
            <div className={labelCls}>Estimated Completion</div>
            <div className={valueCls}>
              {estimated_completion ? new Date(estimated_completion).toLocaleString() : '—'}
            </div>
          </div>

          <div className={fieldRow}>
            <div className={labelCls}>Actual Completion</div>
            <div className={valueCls}>
              {actual_completion ? new Date(actual_completion).toLocaleString() : '—'}
            </div>
          </div>

          <div className={fieldRow}>
            <div className={labelCls}>Updated</div>
            <div className={valueCls}>
              {updated_at ? new Date(updated_at).toLocaleString() : '—'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className={sectionTitle}>Budget & Materials</div>

          <div className={fieldRow}>
            <div className={labelCls}>Budget</div>
            <div className={valueCls}>{budget ?? '—'}</div>
          </div>

          <div className={fieldRow}>
            <div className={labelCls}>Material Needed</div>
            <div className={valueCls}>
              {material_needed ? (
                <pre className="whitespace-pre-wrap break-words text-sm">{material_needed}</pre>
              ) : '—'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className={sectionTitle}>Approvals</div>

          <div className={fieldRow}>
            <div className={labelCls}>Approved By</div>
            <div className={valueCls}>{approverDisplay}</div>
          </div>

          <div className={fieldRow}>
            <div className={labelCls}>Approved At</div>
            <div className={valueCls}>
              {approved_at ? new Date(approved_at).toLocaleString() : '—'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:col-span-2">
          <div className={sectionTitle}>Tags</div>
          <div>
            {tagList.length > 0
              ? tagList.map((t, i) => <span key={i} className={badge}>{t}</span>)
              : <span className="text-sm">—</span>}
          </div>

          <div className={`${sectionTitle} mt-4`}>Documentation Links</div>
          <ul className="list-disc ml-6">
            {docList.length > 0 ? docList.map((url, i) => (
              <li key={i} className="mb-1">
                <a
                  href={/^https?:\/\//i.test(url) ? url : `https://${url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline break-all"
                >
                  {url}
                </a>
              </li>
            )) : <li className="text-sm">—</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectDetail;