import React from 'react';
import Plot from 'react-plotly.js';

const ChartsComponent = ({ chart, status }) => {
  if (status === 'error') {
    return <p className="text-red-500">Error loading chart data.</p>;
  }

  // Display "No chart data" if status is success but chart is empty, or if status implies no data attempt was made or was relevant
  if (status === 'success' && (!chart || chart.length === 0)) {
    return <p className="text-gray-500 mt-4">No chart data to display for the selected criteria.</p>;
  }
  
  // If status is not 'success' (and not 'error', handled above), and also not 'loading' (which Home.jsx might handle more globally),
  // it might be an initial state or "No expenses" state from Home.jsx. In these cases, also indicate no chart.
  // We rely on Home.jsx to pass an appropriate status. If status is 'idle' or 'No expenses', show no chart data.
  if (status !== 'success' && status !== 'error' && status !== 'Loading') { // Assuming 'Loading' is a possible status string
    return <p className="text-gray-500 mt-4">No chart data available.</p>;
  }


  // Only attempt to render charts if status is 'success' and chart data is present
  if (status === 'success' && chart && chart.length > 0) {
    return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {chart.map((figure, index) => (
        <div key={index} className="p-4 border rounded shadow">
          <Plot
            data={figure.data}
            layout={figure.layout}
            useResizeHandler
            className="w-full h-full"
          />
        </div>
      ))}
    </div>
    );
  }

  // Fallback for any other state (e.g., if status is 'loading' and Home.jsx didn't prevent rendering)
  return <p className="text-gray-500 italic mt-4">Chart data is currently being processed or not available.</p>;
};

export default ChartsComponent;
