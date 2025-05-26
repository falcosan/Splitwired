import React, { useLayoutEffect, useCallback, useMemo, memo } from "react";
import api from "@/api";
import Table from "@/components/Table";
import ChartsComponent from "@/components/ChartsComponent";
import DownloadsComponent from "@/components/DownloadsComponent";
import MemoizedSummaryComponent from "@/components/MemoizedSummaryComponent";
import FormComponent from "@/components/FormComponent";
import { useExpenses, useRemovesNullClass } from "@/hooks";
import { buildQueryString } from "@/utils/queryBuilder";

const Header = memo(({ onLogout }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-4 md:p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
    <div className="flex items-center gap-3">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-200">
        Splitwired
      </h1>
    </div>
    <button
      className="px-4 py-2 md:px-6 md:py-3 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 
                 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl 
                 flex items-center gap-2 w-full md:w-auto justify-center text-sm md:text-base"
      onClick={onLogout}
    >
      Logout
    </button>
  </div>
));

Header.displayName = "Header";

const StatusDisplay = memo(({ status, query }) => {
  if (!status || status === "Loading" || status === "Ready") return null;

  return (
    <div className="mt-6 p-4 rounded-lg bg-slate-800">
      {query && (
        <span className="block text-lg font-semibold text-slate-300 mb-2">
          {query}
        </span>
      )}
      <hr className="my-3 border-slate-600" />
      <p className="text-center text-lg font-semibold text-slate-300">
        {status}
      </p>
    </div>
  );
});

StatusDisplay.displayName = "StatusDisplay";

const ExpensesTable = memo(({ expenses, status }) => {
  if (status || expenses.length === 0) return null;

  return (
    <div className="mt-6 bg-slate-800 rounded-lg p-4 md:p-6 shadow-lg overflow-hidden">
      <h3 className="text-lg md:text-xl font-semibold text-slate-200 mb-4 md:mb-6">
        Expenses
      </h3>
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table className="w-full min-w-[600px]" data={expenses} />
        </div>
      </div>
    </div>
  );
});

ExpensesTable.displayName = "ExpensesTable";

const ImprovedHome = () => {
  const {
    status,
    loading,
    downloads,
    data,
    parameters,
    expenses,
    categories,
    summaryInfo,
    min,
    max,
    setParameters,
    handleDateChange,
    initializeData,
    fetchExpenses,
  } = useExpenses();

  const queryStrings = useMemo(() => {
    const current = buildQueryString(
      {
        year: parameters.year,
        month: parameters.month,
        group: parameters.group,
        category: parameters.category,
        personal: parameters.personal,
      },
      data.groups,
      categories,
      min,
      max
    );

    return { current };
  }, [parameters, data.groups, categories, min, max]);

  const handleParameterChange = useCallback(
    (name, value) => {
      setParameters({ [name]: value });
    },
    [setParameters]
  );

  const handleFormSubmit = useCallback(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleLogout = useCallback(async () => {
    try {
      await api.getLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  useLayoutEffect(() => {
    initializeData();
  }, [initializeData]);

  useRemovesNullClass();

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 max-w-7xl">
      <Header onLogout={handleLogout} />

      <DownloadsComponent downloads={downloads} loading={loading} />

      <div className="mt-6">
        <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-wide">
              Current Filter
            </span>
          </div>
          <span className="block text-base md:text-lg font-semibold text-slate-200 break-words">
            {queryStrings.current}
          </span>
        </div>

        <FormComponent
          parameters={parameters}
          onParameterChange={handleParameterChange}
          onDateChange={handleDateChange}
          onSubmit={handleFormSubmit}
          status={status}
          groups={data.groups}
          categories={categories}
          min={min}
          max={max}
        />
      </div>

      <MemoizedSummaryComponent info={summaryInfo} />

      <StatusDisplay status={status} query={queryStrings.current} />

      <ExpensesTable expenses={expenses} status={status} />

      <ChartsComponent chart={data.chart} status={status} expenses={expenses} />
    </div>
  );
};

export default ImprovedHome;
