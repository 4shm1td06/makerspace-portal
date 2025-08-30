import React from 'react';
import NewsList from './NewsList';


const NewsEvents = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">News & Events</h1>
      <NewsList />
    </div>
  );
};

export default NewsEvents;
