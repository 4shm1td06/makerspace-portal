import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const OngoingProjects = () => {
  const [projects, setProjects] = useState([]);

  // Fetch ongoing projects
  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active') // Fetch only active projects
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Subscribe to realtime changes on the projects table
    const subscription = supabase
      .channel('realtime-projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('Realtime change:', payload);
          fetchProjects(); // Refresh on insert/update/delete
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Ongoing Projects</h2>
      {projects.length === 0 ? (
        <p className="text-gray-500">No ongoing projects at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id} className="card">
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <p className="text-gray-700">{project.description}</p>
              <div className="text-sm text-gray-500">Status: {project.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OngoingProjects;
