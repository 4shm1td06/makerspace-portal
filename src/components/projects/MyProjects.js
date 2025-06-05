import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import ProjectCard from './modal/ProjectCard';
import ProjectModal from './modal/ProjectModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    setCurrentPage(1);
  }, [filterStatus]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

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

    const { data: { user }, error: userError } = await supabase.auth.getUser();

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
      setProjects((prev) => prev.filter((p) => p.id !== id));
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error(error);
        fetchProjects();
      }
    }
  };

  const exportCSV = () => {
    const csvData = filteredProjects.map(({ id, ...rest }) => rest);
    if (csvData.length === 0) {
      alert('No data to export.');
      return;
    }

    const escapeCSV = (value) =>
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;

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

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('My Projects', 14, 16);

    if (filteredProjects.length === 0) {
      alert('No projects to export.');
      return;
    }

    const tableData = filteredProjects.map((project, index) => [
      index + 1,
      project.title,
      project.description || 'No description',
      project.status,
      new Date(project.created_at).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [['#', 'Title', 'Description', 'Status', 'Created At']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] },
    });

    doc.save('my-projects.pdf');
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
    <section className="dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Projects</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowModal(true);
              setIsEditing(false);
              setNewProject({ title: '', description: '', status: 'planning' });
            }}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            + Add Project
          </button>
          <button
            onClick={exportCSV}
            className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 dark:hover:bg-green-600"
          >
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-xl shadow hover:bg-red-700 dark:hover:bg-red-600"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['planning', 'active', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              filterStatus === status
                ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading projects...</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 italic">No projects found for this status.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-4 text-sm">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            ← Previous
          </button>
          <span className="text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Next →
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
    </section>
  );
};

export default MyProjects;
