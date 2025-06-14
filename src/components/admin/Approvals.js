import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';

const Approvals = () => {
  const [projectApprovals, setProjectApprovals] = useState([]);
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    const [{ data: approvals, error: approvalError }, { data: supplies, error: supplyError }] =
      await Promise.all([
        supabase.from('approvals').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('supply_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      ]);

    if (approvalError || supplyError) {
      toast.error('Failed to load approvals or supply requests');
      console.error(approvalError || supplyError);
    } else {
      setProjectApprovals(approvals);
      setSupplyRequests(supplies);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProjectDecision = async (id, status) => {
    const { error } = await supabase.from('approvals').update({ status }).eq('id', id);
    if (error) {
      toast.error('Failed to update project approval');
      console.error(error);
    } else {
      toast.success(`Project ${status}`);
      setProjectApprovals((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSupplyDecision = async (id, status) => {
    const { error } = await supabase.from('supply_requests').update({ status }).eq('id', id);
    if (error) {
      toast.error('Failed to update supply request');
      console.error(error);
    } else {
      toast.success(`Supply request ${status}`);
      setSupplyRequests((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (loading) return <div className="p-4">Loading approvals...</div>;

  return (
    <div className="p-4 space-y-8">
      {/* Project Approvals Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Project Approvals</h2>
        {projectApprovals.length === 0 ? (
          <p>No pending project approvals</p>
        ) : (
          <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border p-2 text-left">Request</th>
                <th className="border p-2">Submitted At</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectApprovals.map(({ id, request_detail, created_at }) => (
                <tr key={id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="border p-2">{request_detail}</td>
                  <td className="border p-2">{new Date(created_at).toLocaleString()}</td>
                  <td className="border p-2 text-center space-x-2">
                    <button
                      onClick={() => handleProjectDecision(id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleProjectDecision(id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Supply Requests Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Supply Requests</h2>
        {supplyRequests.length === 0 ? (
          <p>No pending supply requests</p>
        ) : (
          <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border p-2 text-left">Item</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Urgency</th>
                <th className="border p-2">Purpose</th>
                <th className="border p-2">Submitted At</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {supplyRequests.map(
                ({ id, item_name, quantity, unit, urgency, purpose, created_at }) => (
                  <tr key={id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="border p-2">{item_name}</td>
                    <td className="border p-2 text-center">
                      {quantity} {unit}
                    </td>
                    <td className="border p-2 text-center">{urgency}</td>
                    <td className="border p-2">{purpose}</td>
                    <td className="border p-2">{new Date(created_at).toLocaleString()}</td>
                    <td className="border p-2 text-center space-x-2">
                      <button
                        onClick={() => handleSupplyDecision(id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleSupplyDecision(id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Approvals;
