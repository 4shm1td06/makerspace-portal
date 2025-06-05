import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import { format } from 'date-fns';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('news_events')
        .select('*')
        .eq('type', 'event')
        .eq('status', 'published')
        .order('event_date', { ascending: true });

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
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upcoming Events</h2>

      {loading && <p className="text-gray-500 italic">Loading events...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="text-gray-500 italic">No upcoming events at the moment.</p>
      )}

      <ul className="space-y-6">
        {events.map(event => (
          <li key={event.id} className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h3 className="text-blue-600 font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-1">
                  {format(new Date(event.event_date), 'PPP p')}
                </p>
                <p className="text-gray-700 text-sm">{event.summary}</p>
              </div>

              {event.form_url ? (
                <div className="min-w-[90px]">
                  <QRCodeCanvas
                    value={event.form_url}
                    size={80}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                  <p className="text-xs text-center mt-1 text-gray-500">Scan to RSVP</p>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">No form link</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventsList;
