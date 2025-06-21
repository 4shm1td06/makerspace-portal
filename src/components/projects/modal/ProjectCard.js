import React from 'react';
import { Pen, Trash } from 'lucide-react';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border border-gray-100 dark:border-gray-700 transition hover:shadow-md">
      {/* Icon buttons in top-right */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={() => onEdit(project)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          title="Edit"
        >
          <Pen size={18} />
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
          title="Delete"
        >
          <Trash size={18} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-2 pr-10">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{project.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full capitalize font-semibold
            ${
              project.status === 'completed'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : project.status === 'active'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            }
          `}
        >
          {project.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {project.description || (
          <em className="text-gray-400 dark:text-gray-500">No description provided.</em>
        )}
      </p>

      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        <div><strong>ID:</strong> {project.id}</div>
        {project.created_at && (
          <div><strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
