import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

const RegisterSupply = () => {
  const { register, handleSubmit, reset } = useForm();
  const { user } = useAuth();

  const onSubmit = async (data) => {
    // Insert into a new table for pending requests
    const { error } = await supabase.from('supply_requests').insert({
      ...data,
      requester_id: user.id, // Renamed for clarity
      status: 'pending', // Set the initial status
    });
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Supply request submitted'); // Updated message
      reset();
    }
  };

  return (
    <div className="border-2 border-green-500 rounded-lg p-6 shadow-sm bg-white dark:bg-gray-800 dark:border-green-400 transition-colors">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ... (existing form inputs remain the same) */}
        <input
          {...register('item_name', { required: true })}
          placeholder="Item Name"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          {...register('category', { required: true })}
          placeholder="Category"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          {...register('quantity', { required: true, min: 1 })}
          type="number"
          placeholder="Quantity"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          {...register('unit', { required: true })}
          placeholder="Unit (e.g., pcs)"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-semibold transition-colors"
        >
          Request Supply
        </button>
      </form>
    </div>
  );
};

export default RegisterSupply;