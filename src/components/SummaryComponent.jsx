import React from 'react';

const SummaryComponent = ({ info }) => {
  if (!info) {
    return null; // Or some placeholder if preferred
  }

  const { total, average } = info;

  return (
    <div className="mt-4 p-4 border rounded shadow bg-gray-50">
      <h2 className="text-xl font-semibold mb-2 text-gray-700">Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-lg font-medium text-gray-600">Total Expenses:</p>
          <p className="text-2xl font-bold text-blue-600">{total}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-lg font-medium text-gray-600">Average Expense:</p>
          <p className="text-2xl font-bold text-green-600">{average}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryComponent;
