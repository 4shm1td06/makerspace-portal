import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { formatDistanceToNow } from 'date-fns';

const pageSize = 5;

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNewsCount, setTotalNewsCount] = useState(0);

  const fetchNews = async (page = 1) => {
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [{ data, error }, { count }] = await Promise.all([
      supabase
        .from('news')
        .select(`
          id,
          title,
          content,
          category,
          created_at,
          profiles (
            name,
            department
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to),

      supabase
        .from('news')
        .select('*', { count: 'exact', head: true }),
    ]);

    if (error) {
      setError(error.message);
    } else {
      setNews(data || []);
      setTotalNewsCount(count || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNews(currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(totalNewsCount / pageSize);

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Latest News</h2>

      {loading && <p className="text-gray-500 italic">Loading news...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && news.length === 0 && (
        <p className="text-gray-500 italic">No news available.</p>
      )}

      <ul className="space-y-4">
        {news.map((item) => (
          <li key={item.id} className="border-b pb-3">
            <div className="flex justify-between items-center">
              <a
                href={`/news/${item.id}`}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-lg"
              >
                {item.title}
              </a>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  item.category === 'urgent'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {item.category}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {item.content.slice(0, 120)}{item.content.length > 120 && '...'}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Posted {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              {item.profiles?.name && (
                <>
                  {' '}by <span className="font-medium">{item.profiles.name}</span>
                  {item.profiles.department && ` , ${item.profiles.department}`}
                </>
              )}
            </p>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsList;

