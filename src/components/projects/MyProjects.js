import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import ProjectCard from './modal/ProjectCard';
import ProjectModal from './modal/ProjectModal';

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', status: 'planning' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filterStatus]);

  const fetchProjects = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('id', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setProjects(data);
    }

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('User not authenticated:', userError);
      alert('You must be logged in to create a project.');
      setSubmitting(false);
      return;
    }

    const projectData = {
      title: newProject.title,
      description: newProject.description,
      status: newProject.status,
      owner_id: user.id,
    };

    let result;
    if (isEditing) {
      result = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', editingProjectId)
        .eq('owner_id', user.id);
    } else {
      result = await supabase.from('projects').insert([projectData]);
    }

    if (result.error) {
      console.error(result.error);
      alert('Error saving project: ' + result.error.message);
    } else {
      fetchProjects();
      setShowModal(false);
      setIsEditing(false);
      setEditingProjectId(null);
      setNewProject({ title: '', description: '', status: 'planning' });
    }

    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this project?');
    if (confirmed) {
      setProjects((prev) => prev.filter((p) => p.id !== id)); // Optimistic UI
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error(error);
        fetchProjects(); // Recover on error
      }
    }
  };

  const exportCSV = () => {
    const csvData = filteredProjects.map(({ id, ...rest }) => rest);
    if (csvData.length === 0) {
      alert('No data to export.');
      return;
    }

    const escapeCSV = (value) => {
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row) => Object.values(row).map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredProjects = filterStatus
    ? projects.filter((p) => p.status === filterStatus)
    : projects;

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Projects</h2>
        <button
          onClick={() => {
            setShowModal(true);
            setIsEditing(false);
            setNewProject({ title: '', description: '', status: 'planning' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Project
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {['planning', 'active', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        <button
          onClick={exportCSV}
          className="ml-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading projects...</p>
      ) : (
        <ul className="space-y-3">
          {paginatedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => {
                setNewProject(p);
                setEditingProjectId(p.id);
                setIsEditing(true);
                setShowModal(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {!loading && (
        <div className="mt-4 flex justify-between items-center">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <ProjectModal
        show={showModal}
        isEditing={isEditing}
        submitting={submitting}
        project={newProject}
        onChange={setNewProject}
        onClose={() => {
          setShowModal(false);
          setIsEditing(false);
          setEditingProjectId(null);
          setNewProject({ title: '', description: '', status: 'planning' });
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default MyProjects;
