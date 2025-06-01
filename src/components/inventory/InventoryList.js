import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const InventoryList = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []));
  }, []);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Current Inventory</h2>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id}>
            <strong>{item.item_name}</strong> — {item.quantity} {item.unit} ({item.status})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryList;
