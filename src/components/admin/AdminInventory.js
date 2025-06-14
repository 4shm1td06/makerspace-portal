import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: 0 });

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
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async () => {
    const { name, category, quantity } = newItem;
    if (!name || !category) return toast.error('All fields are required');

    const { error } = await supabase.from('inventory').insert([{ name, category, quantity }]);
    if (error) {
      toast.error('Failed to add item');
    } else {
      toast.success('Item added');
      setNewItem({ name: '', category: '', quantity: 0 });
      fetchInventory();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed');
    } else {
      toast.success('Item deleted');
      fetchInventory();
    }
  };

  const handleEdit = async () => {
    const { id, name, category, quantity } = editingItem;
    const { error } = await supabase
      .from('inventory')
      .update({ name, category, quantity })
      .eq('id', id);
    if (error) {
      toast.error('Update failed');
    } else {
      toast.success('Item updated');
      setEditingItem(null);
      fetchInventory();
    }
  };

  const getStatus = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (qty < 5) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  if (loading) return <div className="p-4">Loading inventory...</div>;
  if (items.length === 0) return <div className="p-4">No inventory found</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Inventory Management</h2>

      {/* Add Item */}
      <div className="space-y-2">
        <h3 className="font-medium">Add New Item</h3>
        <div className="flex gap-2 flex-wrap">
          <input
            className="border p-2 rounded dark:bg-gray-800 dark:text-white"
            placeholder="Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <input
            className="border p-2 rounded dark:bg-gray-800 dark:text-white"
            placeholder="Category"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          />
          <input
            className="border p-2 rounded dark:bg-gray-800 dark:text-white"
            placeholder="Quantity"
            type="number"
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

      {/* Inventory Table */}
      <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border p-2 text-left">Name</th>
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
                <td className="border p-2 text-center">{category}</td>
                <td className="border p-2 text-center">{quantity}</td>
                <td className="border p-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="border p-2">{new Date(created_at).toLocaleString()}</td>
                <td className="border p-2 text-center space-x-2">
                  <button
                    onClick={() =>
                      setEditingItem({ id, item_name, category, quantity: Number(quantity) })
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

      {/* Edit Form */}
      {editingItem && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow-md border mt-4">
          <h3 className="font-semibold mb-2">Edit Item</h3>
          <div className="flex gap-2 flex-wrap">
            <input
              className="border p-2 rounded"
              placeholder="Name"
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem({ ...editingItem, name: e.target.value })
              }
            />
            <input
              className="border p-2 rounded"
              placeholder="Category"
              value={editingItem.category}
              onChange={(e) =>
                setEditingItem({ ...editingItem, category: e.target.value })
              }
            />
            <input
              className="border p-2 rounded"
              type="number"
              placeholder="Quantity"
              value={editingItem.quantity}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  quantity: Math.max(0, Number(e.target.value)),
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
