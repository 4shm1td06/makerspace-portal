import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OngoingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchProjects();

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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 transition hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                {project.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {project.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between text-sm">
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
    </section>
  );
};

export default OngoingProjects;
