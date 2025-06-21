import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { format, add, eachDayOfInterval } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_COLORS = {
  Meeting: '#2563eb',
  Workshop: '#059669',
  Deadline: '#b91c1c',
  Personal: '#d97706',
};

const RECURRENCE_OPTIONS = ['None', 'Daily', 'Weekly', 'Monthly'];

const Events = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    id: null,
    date: '',
    start_time: '',
    end_time: '',
    category: 'Meeting',
    recurrence: 'None',
    reminder: false,
    meeting_url: null,
  });
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [activeCategories, setActiveCategories] = useState(Object.keys(CATEGORY_COLORS));
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const calendarRef = useRef();

  const isAdmin = profile?.role === 'admin' || profile?.department === 'management';

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('role, department')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) return toast.error('Failed to fetch events');
    setEvents(buildEventInstances(data));
  };

  const buildEventInstances = (data) => {
    const result = [];
    data.forEach(evt => {
      const color = CATEGORY_COLORS[evt.category] || '#6b7280';
      const base = {
        id: evt.id,
        groupId: evt.id,
        title: evt.title,
        description: evt.description,
        backgroundColor: color,
        borderColor: '#00000020',
        textColor: 'white',
        category: evt.category,
        recurrence: evt.recurrence,
        created_by: evt.created_by,
        meeting_url: evt.meeting_url || null,
      };
      const startDate = new Date(`${evt.date}T${evt.start_time}`);
      const endDate = new Date(`${evt.date}T${evt.end_time}`);
      const recur = evt.recurrence;
      const allDates = recur === 'None' ? [startDate] : eachDayOfInterval({
        start: startDate,
        end: add(startDate, recur === 'Daily' ? { days: 30 } : recur === 'Weekly' ? { weeks: 12 } : { months: 6 }),
      }).filter(d => {
        if (recur === 'Daily') return true;
        if (recur === 'Weekly') return d.getDay() === startDate.getDay();
        if (recur === 'Monthly') return d.getDate() === startDate.getDate();
        return false;
      });
      allDates.forEach(date => {
        const st = new Date(date);
        st.setHours(startDate.getHours(), startDate.getMinutes());
        const en = new Date(date);
        en.setHours(endDate.getHours(), endDate.getMinutes());
        result.push({ ...base, start: st, end: en });
      });
    });
    return result;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = (info) => {
    setFormData({
      title: '',
      description: '',
      id: null,
      date: info.dateStr,
      start_time: '09:00',
      end_time: '10:00',
      category: 'Meeting',
      recurrence: 'None',
      reminder: false,
      meeting_url: null
    });
    setEditMode(false);
    setIsOwner(true);
    setDrawerOpen(true);
  };

  const handleEventClick = ({ event }) => {
    const isCreator = event.extendedProps.created_by === user?.id;
    setFormData({
      title: event.title,
      description: event.extendedProps.description || '',
      id: event.id,
      date: format(event.start, 'yyyy-MM-dd'),
      start_time: format(event.start, 'HH:mm'),
      end_time: format(event.end, 'HH:mm'),
      category: event.extendedProps.category,
      recurrence: event.extendedProps.recurrence || 'None',
      reminder: false,
      meeting_url: event.extendedProps.meeting_url || null
    });
    setSelectedDate(format(event.start, 'yyyy-MM-dd'));
    setEditMode(true);
    setIsOwner(isCreator || isAdmin);
    setDrawerOpen(true);
  };

  const saveEvent = async () => {
    const {
      title, description, id, date, start_time, end_time,
      category, recurrence, reminder
    } = formData;

    if (!title.trim()) return toast.error('Title is required');

    let meeting_url = null;

    if (category === 'Meeting' && isAdmin) {
      const room = `meet-${Math.random().toString(36).substring(2, 8)}-${Date.now()}`;
      meeting_url = `https://meet.jit.si/${room}`;
    }

    const payload = {
      title,
      description: meeting_url ? `${description}\n\nJoin: ${meeting_url}` : description,
      date,
      start_time,
      end_time,
      category,
      recurrence,
      reminder,
      created_by: user.id,
      meeting_url
    };

    if (editMode && id && isOwner) {
      const { error } = await supabase.from('events').update(payload).eq('id', id);
      if (error) return toast.error('Failed to update event');
      toast.success('Event updated');
    } else {
      const { error } = await supabase.from('events').insert([payload]);
      if (error) return toast.error('Failed to create event');
      toast.success('Event created');
      if (meeting_url) window.open(meeting_url, '_blank');
    }

    setDrawerOpen(false);
    fetchEvents();
  };

  const deleteEvent = async () => {
    if (!formData.id || !isOwner) return;
    const { error } = await supabase.from('events').delete().eq('id', formData.id);
    if (error) toast.error('Failed to delete event');
    else {
      toast.success('Event deleted');
      setDrawerOpen(false);
      fetchEvents();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <div className="hidden sm:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-bold mb-3">Filters</h2>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-3 px-2 py-1 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <label key={cat} className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={activeCategories.includes(cat)}
              onChange={() =>
                setActiveCategories(prev =>
                  prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                )
              }
            />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
            <span>{cat}</span>
          </label>
        ))}
        <label className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            checked={showOnlyMine}
            onChange={() => setShowOnlyMine(prev => !prev)}
          />
          <span>My events only</span>
        </label>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events.filter(e =>
            activeCategories.includes(e.category) &&
            (!showOnlyMine || e.created_by === user?.id) &&
            (search.trim() === '' || e.title.toLowerCase().includes(search.toLowerCase()))
          )}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDidMount={({ el, event }) => {
            tippy(el, {
              content: `${event.title}<br/>${event.extendedProps.description}`,
              allowHTML: true,
              theme: 'light-border',
            });
          }}
        />
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed top-0 right-0 w-full sm:w-96 h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 shadow-xl overflow-y-auto z-50">
            <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Event' : 'Create Event'}</h2>
            <input className="w-full border px-2 py-1 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <textarea className="w-full border px-2 py-1 mt-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            <input type="date" className="w-full border px-2 py-1 mt-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            <div className="flex space-x-2 mt-2">
              <input type="time" className="w-full border px-2 py-1 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
              <input type="time" className="w-full border px-2 py-1 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
            </div>
            <select className="w-full border px-2 py-1 mt-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              {Object.keys(CATEGORY_COLORS).map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <select className="w-full border px-2 py-1 mt-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.recurrence} onChange={e => setFormData({ ...formData, recurrence: e.target.value })}>
              {RECURRENCE_OPTIONS.map(opt => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2 mt-2">
              <input type="checkbox" checked={formData.reminder}
                onChange={e => setFormData({ ...formData, reminder: e.target.checked })} />
              <span>Set Reminder</span>
            </label>
            {formData.meeting_url && (
              <a href={formData.meeting_url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-500 underline">
                Join Meeting
              </a>
            )}
            <div className="flex justify-between mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={saveEvent}>Save</button>
              {editMode && isOwner && (
                <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={deleteEvent}>Delete</button>
              )}
              <button className="px-4 py-2 bg-gray-300 dark:bg-gray-600 dark:text-white rounded"
                onClick={() => setDrawerOpen(false)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
