import React, { memo } from "react";

const MemoizedSummaryComponent = memo(({ info }) => {
  if (!info) {
    return null;
  }

  const { total, average } = info;

  return (
    <div className="mt-6 p-4 md:p-6 bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-slate-200 flex items-center gap-2">
        Summary
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div className="p-4 md:p-6 bg-slate-700 rounded-lg shadow">
          <p className="text-sm md:text-lg font-medium text-slate-300 mb-2">
            Total Expenses:
          </p>
          <p className="text-2xl md:text-3xl font-bold text-red-400 break-all">
            €{total}
          </p>
        </div>
        <div className="p-4 md:p-6 bg-slate-700 rounded-lg shadow">
          <p className="text-sm md:text-lg font-medium text-slate-300 mb-2">
            Average Expense:
          </p>
          <p className="text-2xl md:text-3xl font-bold text-blue-400 break-all">
            €{average}
          </p>
        </div>
      </div>
    </div>
  );
});

MemoizedSummaryComponent.displayName = "MemoizedSummaryComponent";

export default MemoizedSummaryComponent;
