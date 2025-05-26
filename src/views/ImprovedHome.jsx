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
  <div className="flex justify-between items-center mb-8 p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-slate-200">Splitwired</h1>
    </div>
    <button
      className="px-6 py-3 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 
                 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl 
                 flex items-center gap-2"
      onClick={onLogout}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
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
    <div className="mt-6 bg-slate-800 rounded-lg p-6 shadow-lg overflow-hidden">
      <h3 className="text-xl font-semibold text-slate-200 mb-4">Expenses</h3>
      <div className="overflow-x-auto">
        <Table className="w-full" data={expenses} />
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
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Header onLogout={handleLogout} />

        <DownloadsComponent downloads={downloads} loading={loading} />

        <div className="mt-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                Current Filter
              </span>
            </div>
            <span className="block text-lg font-semibold text-slate-200">
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

        <ChartsComponent
          chart={data.chart}
          status={status}
          expenses={expenses}
        />
      </div>
    </div>
  );
};

export default ImprovedHome;
