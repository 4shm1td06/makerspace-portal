import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

const BillSubmission = () => {
  const { register, handleSubmit, reset } = useForm();
  const { user } = useAuth();

  const onSubmit = async (data) => {
    const { error } = await supabase.from('bills').insert({
      ...data,
      submitter_id: user.id,
    });
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Bill submitted');
      reset();
    }
  };

  return (
    <div className="border-2 border-green-500 dark:border-green-600 rounded-lg p-6 shadow-sm bg-white dark:bg-gray-900">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register('vendor', { required: true })}
          placeholder="Vendor Name"
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600"
        />
        <input
          {...register('amount', { required: true, min: 0 })}
          type="number"
          step="0.01"
          placeholder="Amount"
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600"
        />
        <input
          {...register('purchase_date', { required: true })}
          type="date"
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600"
        />
        <input
          {...register('category')}
          placeholder="Category"
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600"
        />

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white py-2 px-4 rounded-md font-semibold"
        >
          Submit Bill
        </button>
      </form>
    </div>
  );
};

export default BillSubmission;
