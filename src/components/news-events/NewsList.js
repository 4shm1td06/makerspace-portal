import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const NewsList = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    supabase
      .from('news_events')
      .select('*')
      .eq('type', 'news')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(({ data }) => setNews(data || []));
  }, []);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Latest News</h2>
      <ul className="space-y-2">
        {news.map(item => (
          <li key={item.id}>
            <strong>{item.title}</strong> — {item.summary}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsList;
