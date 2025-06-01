import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

const BillSubmission = () => {
  const { register, handleSubmit } = useForm();
  const { user } = useAuth();

  const onSubmit = async (data) => {
    const { error } = await supabase.from('bills').insert({
      ...data,
      submitter_id: user.id,
    });
    if (error) alert('Error: ' + error.message);
    else alert('Bill submitted');
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Submit Bill</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register('vendor')} placeholder="Vendor Name" className="input" />
        <input {...register('amount')} type="number" step="0.01" placeholder="Amount" className="input" />
        <input {...register('purchase_date')} type="date" className="input" />
        <input {...register('category')} placeholder="Category" className="input" />
        <button type="submit" className="btn-primary w-full">Submit Bill</button>
      </form>
    </div>
  );
};

export default BillSubmission;
