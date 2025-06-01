import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

const EventForm = () => {
  const { register, handleSubmit, reset } = useForm();
  const { user } = useAuth();

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      created_by: user.id,
      status: 'published',
      type: data.type || 'news',
      event_date: data.type === 'event' ? data.event_date : null,
    };

    const { error } = await supabase.from('news_events').insert(payload);
    if (error) alert('Error: ' + error.message);
    else {
      alert('Created successfully');
      reset();
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Create News or Event</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <select {...register('type')} className="input">
          <option value="news">News</option>
          <option value="event">Event</option>
        </select>
        <input {...register('title')} placeholder="Title" className="input" />
        <input {...register('summary')} placeholder="Summary" className="input" />
        <textarea {...register('content')} placeholder="Full Content" className="input" />
        <input {...register('event_date')} type="datetime-local" className="input" />
        <button type="submit" className="btn-primary w-full">Post</button>
      </form>
    </div>
  );
};

export default EventForm;
