import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  // Example: Fetch some analytics data from your supabase table
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Replace with your actual analytics query/table
        const { data, error } = await supabase
          .from('analytics_reports')
          .select('*');

        if (error) throw error;

        setReportData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
      {reportData && reportData.length > 0 ? (
        <table className="min-w-full bg-white dark:bg-gray-700">
          <thead>
            <tr>
              {Object.keys(reportData[0]).map((key) => (
                <th
                  key={key}
                  className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left"
                >
                  {key.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-600' : ''}
              >
                {Object.values(item).map((value, i) => (
                  <td key={i} className="py-2 px-4 border-b border-gray-200 dark:border-gray-600">
                    {value?.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No analytics data available.</p>
      )}
    </div>
  );
};

export default Analytics;
