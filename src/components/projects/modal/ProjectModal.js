import React from 'react';

const ProjectModal = ({ show, isEditing, submitting, project, onChange, onClose, onSubmit }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">{isEditing ? 'Edit Project' : 'New Project'}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={project.title}
            onChange={(e) => onChange({ ...project, title: e.target.value })}
            className="input input-bordered w-full"
            required
          />
          <textarea
            placeholder="Description"
            value={project.description}
            onChange={(e) => onChange({ ...project, description: e.target.value })}
            className="textarea textarea-bordered w-full"
          />
          <select
            value={project.status}
            onChange={(e) => onChange({ ...project, status: e.target.value })}
            className="select select-bordered w-full"
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
