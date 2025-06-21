import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import ProjectCard from './modal/ProjectCard';
import ProjectModal from './modal/ProjectModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setProjects(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProjectId(null);
    setNewProject({ title: '', description: '', status: 'planning' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      alert('Authentication failed.');
      setSubmitting(false);
      return;
    }

    const projectData = {
      title: newProject.title,
      description: newProject.description,
      owner_id: user.id,
      status: newProject.status === 'active' ? 'pending' : newProject.status, // active → pending
    };

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProjectId)
          .eq('owner_id', user.id);

        if (error) throw error;

        fetchProjects();
        resetForm();
        setShowModal(false);
      } else {
        const { error } = await supabase.from('projects').insert([projectData]);
        if (error) throw error;

        if (projectData.status === 'pending') {
          alert('Your request for activating this project has been sent to admin.');
        }

        fetchProjects();
        resetForm();
        setShowModal(false);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }

    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      alert('Error deleting project.');
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const exportCSV = () => {
    const csvData = filteredProjects.map(({ id, ...row }) => row);
    if (!csvData.length) return alert('No data to export.');

    const headers = Object.keys(csvData[0]);
    const rows = csvData.map((row) =>
      headers.map((key) => `"${(row[key] || '').toString().replace(/"/g, '""')}"`).join(',')
    );

    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], {
      type: 'text/csv',
    });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'projects.csv';
    a.click();
  };

  const exportPDF = () => {
    if (!filteredProjects.length) return alert('No projects to export.');

    const doc = new jsPDF();
    doc.text('My Projects', 14, 16);

    const tableData = filteredProjects.map((p, i) => [
      i + 1,
      p.owner_id,
      p.title,
      p.description || '—',
      p.status,
      new Date(p.created_at).toLocaleDateString(),
      p.deadline ? new Date(p.deadline).toLocaleDateString() : '—',
    ]);

    autoTable(doc, {
      head: [['#', 'Owner', 'Title', 'Description', 'Status', 'Created', 'Deadline']],
      body: tableData,
      startY: 20,
    });

    doc.save('projects.pdf');
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
              resetForm();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            + Add Project
          </button>
          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['planning', 'pending', 'active', 'completed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus((prev) => (prev === status ? '' : status))}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-center italic text-gray-500">No projects found.</p>
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
              onDelete={() => handleDelete(project.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            ← Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
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
          resetForm();
        }}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

export default MyProjects;
