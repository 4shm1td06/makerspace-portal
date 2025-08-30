import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const TOOLS_PASSWORD = 'tool';
const MAX_ATTEMPTS = 3;

const ProtectedTools = ({ children }) => {
  const [allowed, setAllowed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(() =>
    parseInt(sessionStorage.getItem('tools_attempts') || '0')
  );
  const [lockedOut, setLockedOut] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('tools_access')
        .eq('id', user.id)
        .single();

      if (!error && data?.tools_access) {
        setAllowed(true);
      } else if (attempts >= MAX_ATTEMPTS) {
        setLockedOut(true);
      } else {
        setShowPrompt(true);
      }

      setLoading(false);
    };

    checkAccess();
  }, [attempts]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password === TOOLS_PASSWORD) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ tools_access: true })
        .eq('id', user.id);

      setAllowed(true);
      setShowPrompt(false);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      sessionStorage.setItem('tools_attempts', newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedOut(true);
        setShowPrompt(false);
      } else {
        alert(`Incorrect password. Attempts left: ${MAX_ATTEMPTS - newAttempts}`);
      }
    }
  };

  if (loading) return null;

  if (allowed) return <>{children}</>;

  if (lockedOut) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-96 max-w-full text-center">
          <h2 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Too many attempts</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">You’ve been locked out. Please refresh or contact admin.</p>
        </div>
      </div>
    );
  }

  return showPrompt ? (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-96 max-w-full"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Enter Tools Password</h2>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          Submit
        </button>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
          Attempts left: {MAX_ATTEMPTS - attempts}
        </p>
      </form>
    </div>
  ) : null;
};

export default ProtectedTools;
