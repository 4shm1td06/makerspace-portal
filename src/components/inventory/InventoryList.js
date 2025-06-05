import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import * as XLSX from 'xlsx';

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching inventory:', error);
      setItems(data || []);
      setLoading(false);
    };

    fetchInventory();
  }, []);

  const uniqueCategories = [...new Set(items.map(item => item.category))];

  const filteredItems = items.filter(item => {
    const matchesSearch = `${item.item_name} ${item.category}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset page when filters change
  }, [searchQuery, selectedCategory]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getStatusBadge = (status) => {
    const base = 'px-2 py-1 text-xs font-semibold rounded-full';
    switch (status) {
      case 'Available': return `${base} bg-green-100 text-green-800`;
      case 'Low Stock': return `${base} bg-yellow-100 text-yellow-800`;
      case 'Out of Stock': return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const renderPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((page, index) =>
      page === '...' ? (
        <span key={index} className="px-2 text-gray-500">…</span>
      ) : (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-1 text-sm border rounded ${
            currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      )
    );
  };

  const exportToExcel = () => {
    const dataToExport = filteredItems.map(item => ({
      Name: item.item_name,
      Category: item.category,
      Quantity: item.quantity,
      Unit: item.unit,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

    XLSX.writeFile(workbook, 'inventory_export.xlsx');
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Current Inventory</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search by name or category"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading inventory...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-gray-500">No matching items found.</p>
      ) : (
        <>
          <table className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.item_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3">
                    <span className={getStatusBadge(item.status)}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Previous
              </button>
              {renderPageNumbers()}
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryList;
