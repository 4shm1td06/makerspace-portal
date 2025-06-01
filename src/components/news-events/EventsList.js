import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const EventsList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    supabase
      .from('news_events')
      .select('*')
      .eq('type', 'event')
      .eq('status', 'published')
      .order('event_date', { ascending: true })
      .then(({ data }) => setEvents(data || []));
  }, []);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
      <ul className="space-y-2">
        {events.map(event => (
          <li key={event.id}>
            <strong>{event.title}</strong> — {new Date(event.event_date).toLocaleString()}
            <div>{event.summary}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventsList;
