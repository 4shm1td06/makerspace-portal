import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { format } from 'date-fns';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles (
            name,
            department
          )
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upcoming Events</h2>

      {loading && <p className="text-gray-500 italic">Loading events...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="text-gray-500 italic">No upcoming events.</p>
      )}

      <ul className="space-y-6">
        {events.map(event => (
          <li key={event.id} className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h3 className="text-blue-600 font-semibold text-lg">{event.title}</h3>

                <p className="text-sm text-gray-500">
                  {format(new Date(event.date), 'PPP')} • {event.start_time} - {event.end_time}
                </p>

                {event.description && (
                  <p className="text-gray-700 text-sm mt-1">{event.description}</p>
                )}

                <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-2">
                  <span className="bg-gray-200 px-2 py-1 rounded-full">
                    Category: {event.category}
                  </span>
                  <span className="bg-gray-200 px-2 py-1 rounded-full">
                    Recurrence: {event.recurrence}
                  </span>
                  {event.reminder && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      🔔 Reminder On
                    </span>
                  )}
                </div>

                {event.profiles?.name && (
                  <p className="text-xs text-gray-500 mt-2">
                    Created by: <strong>{event.profiles.name}</strong>
                    {event.profiles.department && ` , ${event.profiles.department}`}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventsList;
