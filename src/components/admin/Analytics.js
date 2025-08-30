import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { BarChart3, Boxes, Users2 } from 'lucide-react';

const COLORS = ['#38bdf8', '#facc15', '#f87171', '#34d399', '#a78bfa', '#fb923c'];

const Analytics = () => {
  const [statusData, setStatusData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [memberCompareData, setMemberCompareData] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState(null);

  const PRESENCE_THRESHOLD_MS = 60 * 1000; // 1 minute for "online" status
  let debounceTimeout;

  useEffect(() => {
    fetchProjectStatus();
    fetchInventoryData();
    fetchMemberData();

    const channel = supabase
      .channel('realtime-presence')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'presence' },
        () => {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            fetchMemberData(); // debounced real-time refresh
          }, 500);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimeout);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProjectStatus = async () => {
    try {
      setLoading(true);
      const statuses = ['rebuild', 'pending', 'rejected', 'completed', 'planning', 'active'];
      const results = await Promise.all(
        statuses.map((status) =>
          supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('status', status)
        )
      );
      const formatted = results.map((res, index) => ({
        name: statuses[index],
        value: res.count || 0,
      }));
      const total = formatted.reduce((acc, cur) => acc + cur.value, 0);

      setStatusData(formatted);
      setTotalProjects(total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('category, quantity');

      if (error) throw error;

      const categoryMap = {};
      data.forEach((item) => {
        const cat = item.category || 'Unknown';
        const qty = parseInt(item.quantity) || 0;
        categoryMap[cat] = (categoryMap[cat] || 0) + qty;
      });

      const formatted = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }));

      const total = formatted.reduce((acc, cur) => acc + cur.value, 0);

      setInventoryData(formatted);
      setTotalInventory(total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberData = async () => {
    try {
      setLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role');

      const { data: presence, error: presenceError } = await supabase
        .from('presence')
        .select('user_id, last_seen');

      if (profilesError || presenceError) {
        throw profilesError || presenceError;
      }

      const now = Date.now();
      const roleMap = {};
      const onlineMap = {};

      profiles.forEach(({ id, role }) => {
        const key = role || 'Unknown';
        roleMap[key] = (roleMap[key] || 0) + 1;
      });

      presence.forEach(({ user_id, last_seen }) => {
        const user = profiles.find((p) => p.id === user_id);
        if (!user) return;
        const key = user.role || 'Unknown';
        const seenTime = new Date(last_seen).getTime();
        if (now - seenTime < PRESENCE_THRESHOLD_MS) {
          onlineMap[key] = (onlineMap[key] || 0) + 1;
        }
      });

      const roles = Array.from(new Set([...Object.keys(roleMap), ...Object.keys(onlineMap)]));
      const merged = roles.map((role) => ({
        role,
        total: roleMap[role] || 0,
        online: onlineMap[role] || 0,
      }));

      setMemberCompareData(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPieChart = (data, totalLabel, totalValue) => (
    <div className="relative w-full max-w-xl mx-auto h-[300px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {totalValue}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{totalLabel}</p>
        </div>
      </div>
    </div>
  );

  const renderBarChart = (data) => (
    <div className="w-full max-w-3xl mx-auto h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="role" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#cbd5e1" name="Total" />
          <Bar dataKey="online" fill="#38bdf8" name="Online" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-6">
        <HoverButton
          title="Projects"
          icon={<BarChart3 className="h-8 w-8" />}
          colors="from-blue-500 to-blue-700"
          onClick={() => setActiveChart(activeChart === 'project' ? null : 'project')}
        />
        <HoverButton
          title="Inventory"
          icon={<Boxes className="h-8 w-8" />}
          colors="from-emerald-500 to-emerald-700"
          onClick={() => setActiveChart(activeChart === 'inventory' ? null : 'inventory')}
        />
        <HoverButton
          title="Members"
          icon={<Users2 className="h-8 w-8" />}
          colors="from-purple-500 to-purple-700"
          onClick={() => setActiveChart(activeChart === 'members' ? null : 'members')}
        />
      </div>

      {activeChart && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            {activeChart === 'project'
              ? 'Project Status Distribution'
              : activeChart === 'inventory'
              ? 'Inventory Category Distribution'
              : 'Total vs Online Members by Role'}
          </h2>
          {loading ? (
            <div>Loading chart...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : activeChart === 'project' ? (
            renderPieChart(statusData, 'Projects', totalProjects)
          ) : activeChart === 'inventory' ? (
            renderPieChart(inventoryData, 'Items', totalInventory)
          ) : (
            renderBarChart(memberCompareData)
          )}
        </div>
      )}
    </div>
  );
};

const HoverButton = ({ title, icon, colors, onClick }) => (
  <div
    className={`group cursor-pointer w-60 p-6 bg-gradient-to-br ${colors} rounded-3xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 duration-300`}
    onClick={onClick}
  >
    <div className="flex flex-col items-center text-white">
      <div className="bg-white bg-opacity-10 p-4 rounded-full mb-3 group-hover:animate-pulse">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm mt-1 opacity-80">Click to view</p>
    </div>
  </div>
);

export default Analytics;
