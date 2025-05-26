import React from "react";
import Plot from "react-plotly.js";

const ChartsComponent = ({ chart, status }) => {
  if (status === "error") {
    return <p className="text-red-500">Error loading chart data.</p>;
  }

  if (status === "success" && (!chart || chart.length === 0)) {
    return (
      <p className="text-gray-500 mt-4">
        No chart data to display for the selected criteria.
      </p>
    );
  }

  if (status !== "success" && status !== "error" && status !== "Loading") {
    return <p className="text-gray-500 mt-4">No chart data available.</p>;
  }

  if (status === "success" && chart && chart.length > 0) {
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

  return (
    <p className="text-gray-500 italic mt-4">
      Chart data is currently being processed or not available.
    </p>
  );
};

export default ChartsComponent;
