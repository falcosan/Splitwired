import React from "react";
import Plot from "react-plotly.js";

const ChartsComponent = ({ chart, status, expenses = [] }) => {
  if (status === "Error") {
    return <p className="text-red-500">Error loading chart data.</p>;
  }

  if (status === "Loading") {
    return <p className="text-gray-500 mt-4">Loading chart data...</p>;
  }

  if (!chart || chart.length === 0 || expenses.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-slate-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-slate-200 mb-4">Charts</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {chart.map((figure, index) => (
          <div key={index} className="p-4 bg-slate-700 rounded shadow">
            <Plot
              data={figure.data}
              layout={{
                ...figure.layout,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: { color: "#e2e8f0" },
              }}
              useResizeHandler
              className="w-full h-full"
              config={{ displayModeBar: false }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartsComponent;
