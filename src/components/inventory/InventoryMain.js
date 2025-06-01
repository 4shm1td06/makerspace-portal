import React from 'react';
import InventoryList from './InventoryList';
import SupplyRequest from './SupplyRequest';
import RegisterSupply from './RegisterSupply';
import BillSubmission from './BillSubmission';

const InventoryMain = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Inventory Management</h1>
      <InventoryList />
      <SupplyRequest />
      <RegisterSupply />
      <BillSubmission />
    </div>
  );
};

export default InventoryMain;
