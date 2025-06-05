import React, { useState, useEffect } from 'react';
import InventoryList from './InventoryList';
import SupplyRequest from './SupplyRequest';
import RegisterSupply from './RegisterSupply';
import BillSubmission from './BillSubmission';

const InventoryMain = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Toggle 'dark' class on <html> element
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          
        </div>

        {/* Inventory List Card */}
        <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 rounded-2xl p-5">
          <h2 className="text-xl font-semibold mb-4">Inventory List</h2>
          <InventoryList />
        </div>

        {/* Supply Request Card */}
        <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 rounded-2xl p-5">
          <h2 className="text-xl font-semibold mb-4">Request Supplies</h2>
          <SupplyRequest />
        </div>

        {/* Register Supply Card */}
        <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 rounded-2xl p-5">
          <h2 className="text-xl font-semibold mb-4">Register New Supply</h2>
          <RegisterSupply />
        </div>

        {/* Bill Submission Card */}
        <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 rounded-2xl p-5">
          <h2 className="text-xl font-semibold mb-4">Submit Bill</h2>
          <BillSubmission />
        </div>
      </div>
    </div>
  );
};

export default InventoryMain;
