import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

const RegisterSupply = () => {
  const { register, handleSubmit } = useForm();
  const { user } = useAuth();

  const onSubmit = async (data) => {
    const { error } = await supabase.from('inventory').insert({
      ...data,
      owner_id: user.id,
    });
    if (error) alert('Error: ' + error.message);
    else alert('Supply registered');
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Register New Supply</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register('item_name')} placeholder="Item Name" className="input" />
        <input {...register('category')} placeholder="Category" className="input" />
        <input {...register('quantity')} type="number" placeholder="Quantity" className="input" />
        <input {...register('unit')} placeholder="Unit (e.g., pcs)" className="input" />
        <button type="submit" className="btn-primary w-full">Add Supply</button>
      </form>
    </div>
  );
};

export default RegisterSupply;
