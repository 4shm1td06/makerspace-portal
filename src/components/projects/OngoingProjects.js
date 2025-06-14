import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OngoingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  // Fetch current logged-in user
  const fetchUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserEmail(user.email);
    } else if (error) {
      console.error('Failed to get user:', error.message);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data);
    }
    setLoading(false);
  };

  const updateDescription = async (id) => {
    const { error } = await supabase
      .from('projects')
      .update({ description: editedDescription })
      .eq('id', id);

    if (error) {
      alert('Failed to update description: ' + error.message);
    } else {
      setEditingId(null);
      setEditedDescription('');
      fetchProjects();
    }
  };

  const handleCollaborators = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  useEffect(() => {
    fetchProjects();
    fetchUser();

    const subscription = supabase
      .channel('realtime-projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Ongoing Projects', 14, 16);

    const tableData = projects.map((project, index) => [
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
      headStyles: { fillColor: [52, 73, 94] },
    });

    doc.save('ongoing-projects.pdf');
  };

  return (
    <section className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ongoing Projects
        </h2>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
        >
          Export as PDF
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400 italic">Loading ongoing projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 italic">No ongoing projects at the moment.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 transition hover:shadow-lg"
            >
              {/* Edit Description Button */}
              <button
                className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => {
                  setEditingId(project.id);
                  setEditedDescription(project.description || '');
                }}
              >
                Edit Description
              </button>

              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                {project.title}
              </h3>

              {editingId === project.id ? (
                <>
                  <textarea
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-800 dark:text-white dark:bg-gray-700 mt-2"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={3}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => updateDescription(project.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {project.description || 'No description provided.'}
                </p>
              )}

              {/* Collaborators Button */}
              <button
                onClick={() => handleCollaborators(project)}
                className="mt-1 mb-3 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                Collaborators
              </button>

              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500 dark:text-gray-400">
                  <strong>Status:</strong>{' '}
                  <span className="text-blue-600 dark:text-blue-400">{project.status}</span>
                </span>
                <span className="text-gray-400 text-xs dark:text-gray-500">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-lg relative">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Collaborators – {selectedProject.title}
            </h3>

            <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Members:</strong></p>
              <ul className="list-disc list-inside pl-2 mt-2">
                {currentUserEmail ? (
                  <li>{currentUserEmail} <span className="text-green-600 font-semibold">(Admin)</span></li>
                ) : (
                  <li>Loading user...</li>
                )}
              </ul>
            </div>

            <button
              className="w-full mb-3 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
              onClick={() => alert('Invite form coming soon')}
            >
              Invite Members
            </button>

            <button
              className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500 text-sm"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default OngoingProjects;