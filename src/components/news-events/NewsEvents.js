import React from 'react';
import NewsList from './NewsList';
import EventsList from './EventsList';

const NewsEvents = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">News & Events</h1>
      <NewsList />
      <EventsList />
    </div>
  );
};

export default NewsEvents;
