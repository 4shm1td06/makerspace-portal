// components/common/PasswordPrompt.js
import React, { useState } from 'react';

const PasswordPrompt = ({ onSubmit, onCancel }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    onSubmit(input);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enter Tools Password</h2>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter password"
          className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-1 bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-1 bg-blue-600 text-white rounded-md">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordPrompt;
