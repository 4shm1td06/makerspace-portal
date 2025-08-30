import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const NewsPage = () => {
  const { user } = useAuth();
  const [newsList, setNewsList] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isFormVisible, setIsFormVisible] = useState(false);

  // 🔄 Fetch all news entries
  const fetchNews = async () => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error('Failed to load news');
    else setNewsList(data);
  };

  // ✅ Check department on button click
  const handleToggleForm = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('department')
      .eq('id', user.id)
      .single();

    if (error || !data?.department) {
      toast.error('Unable to verify your department');
      return;
    }

    const dept = data.department.toLowerCase();
    if (dept === 'management' || dept === 'erp') {
      setIsFormVisible(!isFormVisible);
    } else {
      toast.warn('Only management or erp can post news');
    }
  };

  // ✅ Submit news post
  const handleCreateNews = async () => {
    if (!newTitle || !newContent) return toast.warning('Fill all fields');

    const { error } = await supabase.from('news').insert([
      {
        title: newTitle,
        content: newContent,
        category,
        created_by: user.id,
      },
    ]);

    if (error) toast.error('Error creating news');
    else {
      toast.success('News posted!');
      setNewTitle('');
      setNewContent('');
      setCategory('general');
      setIsFormVisible(false);
      fetchNews();
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">News</h1>

      {/* ✅ Add News Button (visible to everyone, logic on click) */}
      <div className="mb-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleToggleForm}
        >
          {isFormVisible ? 'Cancel' : 'Add News'}
        </button>
      </div>

      {/* 📝 News Form (only shown to management/erp after check) */}
      {isFormVisible && (
        <div className="mb-6 space-y-2">
          <input
            className="w-full p-2 border rounded"
            placeholder="News Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="w-full p-2 border rounded"
            placeholder="News Content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <select
            className="w-full p-2 border rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="general">General</option>
            <option value="urgent">Urgent</option>
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleCreateNews}
          >
            Post News
          </button>
        </div>
      )}

      {/* 📰 News List */}
      <ul className="space-y-4">
        {newsList.map((news) => (
          <li key={news.id} className="border p-4 rounded shadow">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xl font-semibold">{news.title}</h2>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                  news.category === 'urgent'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {news.category}
              </span>
            </div>
            <p>{news.content}</p>
            <p className="text-sm text-gray-500">
              {new Date(news.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsPage;
