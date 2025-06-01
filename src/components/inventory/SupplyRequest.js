import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

const SupplyRequest = () => {
  const { register, handleSubmit } = useForm();
  const { user } = useAuth();

  const onSubmit = async (data) => {
    const { error } = await supabase.from('supply_requests').insert({
      ...data,
      requester_id: user.id,
    });
    if (error) alert('Error: ' + error.message);
    else alert('Request submitted');
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Request Supplies</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register('item_name')} placeholder="Item Name" className="input" />
        <input {...register('description')} placeholder="Description" className="input" />
        <input {...register('quantity')} type="number" placeholder="Quantity" className="input" />
        <select {...register('urgency')} className="input">
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button type="submit" className="btn-primary w-full">Submit Request</button>
      </form>
    </div>
  );
};

export default SupplyRequest;
