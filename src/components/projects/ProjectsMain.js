import React from 'react';
import MyProjects from './MyProjects';
import OngoingProjects from './OngoingProjects';
import DocumentationUpload from './DocumentationUpload';

const ProjectsMain = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Project Management</h1>
      <MyProjects />
      <OngoingProjects />
      <DocumentationUpload />
    </div>
  );
};

export default ProjectsMain;
