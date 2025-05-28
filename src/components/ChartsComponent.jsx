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
    <div className="mt-6 bg-stone-800 rounded-lg p-4 md:p-6 shadow-lg">
      <h3 className="text-lg md:text-xl font-semibold text-stone-200 mb-4 md:mb-6 flex items-center gap-2">
        Charts
      </h3>
      <div className="grid gap-4 md:gap-6">
        {chart.map((figure, index) => (
          <div
            key={index}
            className="p-3 md:p-4 bg-stone-700 rounded-lg shadow min-h-0"
          >
            <Plot
              data={figure.data}
              layout={{
                ...figure.layout,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: { color: "#e2e8f0" },
                margin: { l: 40, r: 20, t: 40, b: 40 },
                autosize: true,
              }}
              useResizeHandler
              className="w-full"
              style={{ minHeight: "250px" }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartsComponent;
