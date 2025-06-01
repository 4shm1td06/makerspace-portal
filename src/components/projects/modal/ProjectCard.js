import React from 'react';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  return (
    <li className="p-4 bg-white rounded shadow border">
      <h3 className="text-lg font-semibold">{project.title}</h3>
      <p className="text-sm text-gray-600">{project.description}</p>
      <div className="flex gap-2 mt-2">
        <button onClick={() => onEdit(project)} className="text-blue-600 hover:underline">Edit</button>
        <button onClick={() => onDelete(project.id)} className="text-red-600 hover:underline">Delete</button>
      </div>
    </li>
  );
};

export default ProjectCard;
