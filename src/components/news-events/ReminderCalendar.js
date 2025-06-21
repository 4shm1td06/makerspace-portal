// All your existing imports...
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
import classNames from 'classnames';

const CATEGORY_COLORS = {
  Deadline: '#b91c1c',
  Personal: '#d97706',
};

const RECURRENCE_OPTIONS = ['None', 'Daily', 'Weekly', 'Monthly'];

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    id: null,
    date: '',
    start_time: '',
    end_time: '',
    reminder: false,
    category: 'Meeting',
    recurrence: 'None',
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const calendarRef = useRef();

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) return console.error(error.message);
    setEvents(buildEventInstances(data));
  };

  const buildEventInstances = (data) => {
    const result = [];
    data.forEach(evt => {
      const color = CATEGORY_COLORS[evt.category] || '#6b7280';
      const base = {
        id: evt.id,
        groupId: evt.id,
        title: evt.title + (evt.created_by === user?.id ? ' 👤' : ''),
        description: evt.description,
        backgroundColor: color,
        borderColor: '#00000020',
        textColor: 'white',
        category: evt.category,
        recurrence: evt.recurrence,
        created_by: evt.created_by,
      };
      const startDate = new Date(`${evt.date}T${evt.start_time}`);
      const endDate = new Date(`${evt.date}T${evt.end_time}`);
      const recur = evt.recurrence;
      const allDates = recur === 'None'
        ? [startDate]
        : eachDayOfInterval({
            start: startDate,
            end: add(startDate, recur === 'Daily' ? { days: 30 } :
                           recur === 'Weekly' ? { weeks: 12 } :
                                               { months: 6 })
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

  const conflictCheck = (date, startTime, endTime) => {
    const newStart = new Date(`${date}T${startTime}`);
    const newEnd = new Date(`${date}T${endTime}`);
    return events.some(evt => {
      const s = new Date(evt.start);
      const e = new Date(evt.end);
      return (
        evt.created_by === user?.id &&
        ((newStart >= s && newStart < e) ||
         (newEnd > s && newEnd <= e) ||
         (newStart <= s && newEnd >= e))
      );
    });
  };

  const handleEventMount = (info) => {
    tippy(info.el, {
      content: `
        <strong>${info.event.title.replace(' 👤','')}</strong><br/>
        ${format(info.event.start, 'Pp')} – ${format(info.event.end, 'Pp')}<br/>
        ${info.event.extendedProps.description}
      `,
      allowHTML: true,
      theme: 'light-border',
    });
  };

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setFormData({
      title: '',
      description: '',
      id: null,
      date: info.dateStr,
      start_time: '09:00',
      end_time: '10:00',
      reminder: false,
      category: 'Personal',
      recurrence: 'None',
    });
    setEditMode(false);
    setIsOwner(true);
    setDrawerOpen(true);
  };

  const handleEventClick = ({ event }) => {
    const editable = event.extendedProps.created_by === user?.id;
    setFormData({
      title: event.title.replace(' 👤',''),
      description: event.extendedProps.description || '',
      id: event.id,
      date: format(event.start, 'yyyy-MM-dd'),
      start_time: format(event.start, 'HH:mm'),
      end_time: format(event.end, 'HH:mm'),
      reminder: false,
      category: event.extendedProps.category,
      recurrence: event.extendedProps.recurrence || 'None',
    });
    setSelectedDate(format(event.start, 'yyyy-MM-dd'));
    setEditMode(true);
    setIsOwner(editable);
    setDrawerOpen(true);
  };

  const saveEvent = async () => {
    const { title, description, id, date, start_time, end_time, category, recurrence } = formData;
    if (!title.trim()) return toast.error('Title is required');
    if (!start_time || !end_time) return toast.error('Time is required');
    if (conflictCheck(date, start_time, end_time)) return toast.warn('Time conflict detected');

    if (editMode && id && isOwner) {
      const { error } = await supabase.from('events')
        .update({ title, description, start_time, end_time, category, recurrence })
        .eq('id', id);
      if (error) toast.error('Failed to update');
      else toast.success('Event updated');
    } else {
      const { error } = await supabase.from('events')
        .insert([{ title, description, date, start_time, end_time, category, recurrence, reminder: false, created_by: user.id }]);
      if (error) toast.error('Failed to create');
      else toast.success('Created');
    }
    setDrawerOpen(false);
    fetchEvents();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar Filters */}
      <div className="hidden sm:block w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center"><span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span> Your Events</li>
          {Object.entries(CATEGORY_COLORS).map(([cat, clr]) => (
            <li key={cat} className="flex items-center">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: clr, marginRight: '0.5rem' }}></span> {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-4 sm:p-6">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-4">Team Calendar</motion.h1>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          editable selectable eventResizableFromStart
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          events={events}
          eventDidMount={handleEventMount}
          height="auto"
        />
      </div>

      {/* Drawer Form */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ y: isMobile ? '100%' : '0', x: isMobile ? 0 : '100%' }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: isMobile ? '100%' : '0', x: isMobile ? 0 : '100%' }}
            transition={{ duration: 0.3 }}
            className={classNames("fixed inset-0 z-50 bg-white dark:bg-gray-900 shadow-xl border-l dark:border-gray-700 overflow-y-auto", {
              'sm:right-0 sm:w-[400px]': !isMobile,
              'w-full h-1/2 bottom-0 left-0': isMobile,
            })}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {editMode ? 'Event Details' : 'New Event'} – {selectedDate}
              </h2>
              <button onClick={() => setDrawerOpen(false)}>✕</button>
            </div>

            {editMode && (
              <div className="flex justify-end px-6 pt-2">
                <button onClick={() => setShowDetails(true)} className="text-sm text-blue-600 hover:underline">View Event Details</button>
              </div>
            )}

            <form onSubmit={e => { e.preventDefault(); saveEvent(); }} className="p-6 space-y-4">
              <input type="text" className="w-full p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700" placeholder="Event Title"
                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="w-full p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700" placeholder="Description"
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <div className="flex gap-2">
                <input type="time" className="flex-1 p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                <input type="time" className="flex-1 p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
              </div>
              <select className="w-full p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700"
                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                {Object.keys(CATEGORY_COLORS).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select className="w-full p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700"
                value={formData.recurrence} onChange={e => setFormData({ ...formData, recurrence: e.target.value })}>
                {RECURRENCE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <button type="submit" className="w-full p-2 rounded bg-blue-600 text-white font-semibold">
                {editMode ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
            onClick={() => setShowDetails(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full space-y-2"
            >
              <h3 className="text-xl font-semibold mb-2 dark:bg-gray-800 dark:text-white">📅 Event Info</h3>
              <p className="dark:bg-gray-800 dark:text-white"><strong>Title:</strong> {formData.title}</p>
              <p className="dark:bg-gray-800 dark:text-white"><strong>Date:</strong> {formData.date}</p>
              <p className="dark:bg-gray-800 dark:text-white"><strong>Time:</strong> {formData.start_time} – {formData.end_time}</p>
              <p className="dark:bg-gray-800 dark:text-white"><strong>Category:</strong> {formData.category}</p>
              <p className="dark:bg-gray-800 dark:text-white"><strong>Recurrence:</strong> {formData.recurrence}</p>
              <p className="dark:bg-gray-800 dark:text-white"><strong>Description:</strong><br />{formData.description || '(none)'}</p>
              <div className="text-right mt-4">
                <button onClick={() => setShowDetails(false)} className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Close</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
