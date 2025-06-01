import { supabase } from './supabase';

export const inventoryService = {
  getInventory: async () => {
    return await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });
  },

  addSupply: async (itemData) => {
    return await supabase
      .from('inventory')
      .insert([itemData]);
  },

  requestSupply: async (requestData) => {
    return await supabase
      .from('supply_requests')
      .insert([requestData]);
  },

  submitBill: async (billData) => {
    return await supabase
      .from('bills')
      .insert([billData]);
  },
};
