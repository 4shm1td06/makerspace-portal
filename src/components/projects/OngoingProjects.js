import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';

const OngoingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [sending, setSending] = useState(false);

  // ✅ Fetch Ongoing Projects
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
      // ✅ Parse Collab_requests to ensure it's always an array
      const formatted = data.map((p) => ({
        ...p,
        Collab_requests: p.Collab_requests
          ? Array.isArray(p.Collab_requests)
            ? p.Collab_requests
            : JSON.parse(p.Collab_requests)
          : [],
      }));
      setProjects(formatted);
    }
    setLoading(false);
  };

  // ✅ Fetch All Profiles (Collaborators including Admin)
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching profiles:', error);
    } else {
      setProfiles(data);
    }
  };

  // ✅ Open Modal for Selected Project
  const handleCollaborators = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  // ✅ Send Collaboration Request & Notification
  const sendCollaborationRequest = async () => {
    if (!selectedProfile) {
      toast.error('Please select a collaborator.');
      return;
    }

    setSending(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Failed to fetch user info.');
      setSending(false);
      return;
    }

    const newRequest = {
      project_id: selectedProject.id,
      requester_email: user.email,
      collaborator_email: selectedProfile.email,
      collaborator_name: selectedProfile.name,
      status: 'pending',
    };

    const updatedRequests = [...(selectedProject.Collab_requests ?? []), newRequest];

    // ✅ Update Project Collab Requests
    const { error } = await supabase
      .from('projects')
      .update({
        Collab_requests: updatedRequests,
      })
      .eq('id', selectedProject.id);

    if (error) {
      toast.error('Failed to send collaboration request: ' + error.message);
      setSending(false);
      return;
    }

    // ✅ Insert Notification for Collaborator
    await supabase.from('notifications').insert([
      {
        user_id: selectedProfile.id,
        type: 'collaboration_request',
        message: `${user.email} invited you to collaborate on project "${selectedProject.title}".`,
        status: 'pending',
      },
    ]);

    toast.success('Collaboration request sent for approval!');
    setShowModal(false);
    setSelectedProfile(null);
    setSending(false);
  };

  // ✅ Export Projects to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Ongoing Projects Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

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
      startY: 28,
      styles: { fontSize: 9, cellWidth: 'wrap' },
      columnStyles: { 2: { cellWidth: 70 } },
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    doc.save('ongoing-projects.pdf');
  };

  // ✅ Fetch Projects & Profiles + Realtime Updates
  useEffect(() => {
    fetchProjects();
    fetchProfiles();

    const subscription = supabase
      .channel('realtime-projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <section className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ongoing Projects</h2>
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
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{project.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {project.description || 'No description provided.'}
              </p>

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

      {/* ✅ Collaborators Modal */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg shadow-lg relative">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Collaborators – {selectedProject.title}
            </h3>

            {selectedProject.Collab_requests && selectedProject.Collab_requests.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Existing Requests:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 border rounded p-2 max-h-32 overflow-y-auto">
                  {selectedProject.Collab_requests.map((req, i) => (
                    <li key={i} className="border-b py-1">
                      {req.collaborator_name} ({req.collaborator_email}) –{' '}
                      <span className="capitalize">{req.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Collaborator:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 border rounded p-2 max-h-48 overflow-y-auto">
                {profiles.map((profile) => (
                  <li
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile)}
                    className={`p-2 rounded cursor-pointer ${
                      selectedProfile?.id === profile.id
                        ? 'bg-green-100 dark:bg-green-800'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <strong>{profile.name}</strong> – {profile.email} ({profile.role})
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full mb-3 ${
                sending ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              } text-white py-2 rounded text-sm`}
              onClick={sendCollaborationRequest}
              disabled={sending || !selectedProfile}
            >
              {sending ? 'Sending...' : 'Send Request'}
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
