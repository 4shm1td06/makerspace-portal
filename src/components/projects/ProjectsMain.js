import React from 'react';
import MyProjects from './MyProjects';
import OngoingProjects from './OngoingProjects';
import DocumentationUpload from './DocumentationUpload';

export default function ProjectsMain() {
  return (
    <div className="p-6 space-y-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Project Management
        </h1>
      </div>

      <MyProjects />
      <OngoingProjects />
      <DocumentationUpload />
    </div>
  );
}
