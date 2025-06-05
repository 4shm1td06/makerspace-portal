import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { formatDistanceToNow } from 'date-fns';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('news_events')
        .select('*')
        .eq('type', 'news')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setNews(data || []);
      }

      setLoading(false);
    };

    fetchNews();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Latest News</h2>

      {loading && <p className="text-gray-500 italic">Loading news...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && news.length === 0 && (
        <p className="text-gray-500 italic">No news published at the moment.</p>
      )}

      <ul className="space-y-4">
        {news.map(item => (
          <li key={item.id} className="border-b pb-3">
            <a href={`/news/${item.id}`} className="text-blue-600 font-semibold hover:underline">
              {item.title}
            </a>
            <p className="text-gray-600 text-sm">{item.summary}</p>
            <p className="text-xs text-gray-400 mt-1">
              Published {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsList;
