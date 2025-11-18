import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const [newItem, setNewItem] = useState({
    item_name: '',
    category: '',
    quantity: 0
  });

  // --------------------------------------------------------
  // Fetch Inventory
  // --------------------------------------------------------
  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load inventory');
      console.error(error);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  };

  // --------------------------------------------------------
  // Fetch Pending Supply Requests
  // --------------------------------------------------------
  const fetchSupplyRequests = async () => {
    setLoadingRequests(true);
    const { data, error } = await supabase
      .from('supply_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load supply requests');
      console.error(error);
    } else {
      setSupplyRequests(data || []);
    }

    setLoadingRequests(false);
  };

  // --------------------------------------------------------
  // Add New Item
  // --------------------------------------------------------
  const handleAddItem = async () => {
    const { item_name, category, quantity } = newItem;

    if (!item_name || !category) {
      return toast.error('All fields are required');
    }

    const { error } = await supabase.from('inventory').insert([
      { item_name, category, quantity }
    ]);

    if (error) {
      toast.error(`Failed to add item: ${error.message}`);
      console.error(error);
    } else {
      toast.success('Item added successfully');
      setNewItem({ item_name: '', category: '', quantity: 0 });
      fetchInventory();
    }
  };

  // --------------------------------------------------------
  // Delete Item
  // --------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    const { error } = await supabase.from('inventory').delete().eq('id', id);

    if (error) {
      toast.error('Delete failed');
    } else {
      toast.success('Item deleted');
      fetchInventory();
    }
  };

  // --------------------------------------------------------
  // Edit Item
  // --------------------------------------------------------
  const handleEdit = async () => {
    const { id, item_name, category, quantity } = editingItem;

    const { error } = await supabase
      .from('inventory')
      .update({ item_name, category, quantity })
      .eq('id', id);

    if (error) {
      toast.error('Update failed');
    } else {
      toast.success('Item updated');
      setEditingItem(null);
      fetchInventory();
    }
  };

  // --------------------------------------------------------
  // Approve Supply Request
  // --------------------------------------------------------
  const handleApproveSupply = async (request) => {
    const { id, item_name, quantity, unit } = request;

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      const { data: existing, error: fetchError } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('item_name', item_name)
        .single();

      if (fetchError) throw fetchError;

      if (!existing) return toast.error('Item not found');

      if (existing.quantity < quantity) {
        return toast.error('Not enough stock');
      }

      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: existing.quantity - quantity })
        .eq('id', existing.id);

      if (updateError) throw updateError;

      const { error: reqError } = await supabase
        .from('supply_requests')
        .update({
          status: 'fulfilled',
          approved_by: user.id,
          approved_at: new Date()
        })
        .eq('id', id);

      if (reqError) throw reqError;

      toast.success(`${quantity} ${unit} of ${item_name} approved`);
      fetchInventory();
      fetchSupplyRequests();
    } catch (err) {
      console.error(err);
      toast.error('Approval failed');
    }
  };

  // --------------------------------------------------------
  // Reject Supply Request
  // --------------------------------------------------------
  const handleRejectSupply = async (id) => {
    const { error } = await supabase
      .from('supply_requests')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) toast.error('Failed to reject');
    else {
      toast.success('Request rejected');
      fetchSupplyRequests();
    }
  };

  const getStatus = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-200 text-red-800' };
    if (qty < 5) return { label: 'Low Stock', color: 'bg-yellow-200 text-yellow-900' };
    return { label: 'In Stock', color: 'bg-green-200 text-green-900' };
  };

  useEffect(() => {
    fetchInventory();
    fetchSupplyRequests();
  }, []);

  if (loading || loadingRequests) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Inventory Management</h2>

      {/* --------------------------------------------------
        Add New Item
      -------------------------------------------------- */}
      <div className="space-y-2">
        <h3 className="font-medium">Add New Item</h3>
        <div className="flex gap-2 flex-wrap">
          <input
            className="border p-2 rounded dark:bg-gray-800 dark:text-white"
            placeholder="Name"
            value={newItem.item_name}
            onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
          />

          <select
            className="border p-2 rounded dark:bg-gray-800 dark:text-white"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="Microcontrollers">Micro Controllers</option>
            <option value="Sensors">Sensors</option>
            <option value="Electronics">Electronics</option>
            <option value="Battery Holders">Battery Holders</option>
            <option value="Battery">Battery</option>
            <option value="Hardware">Hardware</option>
            <option value="Microprocessor">Micro Processor</option>
            <option value="Others">Others</option>
          </select>

          <input
            type="number"
            className="border p-2 rounded dark:bg-gray-800 dark:text-white"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem({ ...newItem, quantity: Math.max(0, Number(e.target.value)) })
            }
          />

          <button
            onClick={handleAddItem}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>

      {/* --------------------------------------------------
        Pending Requests
      -------------------------------------------------- */}
      {supplyRequests.length > 0 && (
        <div>
          <h3 className="font-medium">
            Pending Supply Requests ({supplyRequests.length})
          </h3>

          {supplyRequests.map((request) => (
            <div key={request.id} className="p-4 border rounded-lg shadow-sm mt-2">
              <p className="font-semibold">{request.item_name}</p>
              <p>Category: {request.category}</p>
              <p>Quantity: {request.quantity}</p>
              <p>Unit: {request.unit}</p>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleApproveSupply(request)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRejectSupply(request.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --------------------------------------------------
        Inventory Table
      -------------------------------------------------- */}
      <h3 className="text-lg font-medium">Current Inventory</h3>

      {items.length === 0 ? (
        <div>No items found</div>
      ) : (
        <table className="w-full table-auto border border-gray-300">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="border p-2">Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Created</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map(({ id, item_name, category, quantity, created_at }) => {
              const status = getStatus(quantity);

              return (
                <tr key={id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="border p-2">{item_name}</td>
                  <td className="border p-2">{category}</td>
                  <td className="border p-2 text-center">{quantity}</td>

                  <td className="border p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td className="border p-2">
                    {new Date(created_at).toLocaleString()}
                  </td>

                  <td className="border p-2 text-center space-x-2">
                    <button
                      onClick={() =>
                        setEditingItem({
                          id,
                          item_name,
                          category,
                          quantity: Number(quantity)
                        })
                      }
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* --------------------------------------------------
        Edit Form
      -------------------------------------------------- */}
      {editingItem && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow-md border mt-4">
          <h3 className="font-semibold mb-2">Edit Item</h3>

          <div className="flex gap-2 flex-wrap">
            <input
              className="border p-2 rounded"
              value={editingItem.item_name}
              onChange={(e) =>
                setEditingItem({ ...editingItem, item_name: e.target.value })
              }
            />

            <select
              className="border p-2 rounded"
              value={editingItem.category}
              onChange={(e) =>
                setEditingItem({ ...editingItem, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              <option value="Microcontrollers">Micro Controllers</option>
              <option value="Sensors">Sensors</option>
              <option value="Electronics">Electronics</option>
              <option value="Battery Holders">Battery Holders</option>
              <option value="Battery">Battery</option>
              <option value="Hardware">Hardware</option>
              <option value="Microprocessor">Micro Processor</option>
              <option value="Others">Others</option>
            </select>

            <input
              type="number"
              className="border p-2 rounded"
              value={editingItem.quantity}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  quantity: Math.max(0, Number(e.target.value))
                })
              }
            />

            <button
              onClick={handleEdit}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            >
              Save
            </button>

            <button
              onClick={() => setEditingItem(null)}
              className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
