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
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-slate-200">Expense Tracker</h1>
    <button
      className="px-4 py-2 font-semibold rounded-lg border-2 hover:bg-opacity-80 border-slate-300 text-zinc-900 bg-[#5dc4a7] transition-colors"
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Header onLogout={handleLogout} />

        <DownloadsComponent downloads={downloads} loading={loading} />

        <div className="mt-6">
          <span className="block text-lg font-semibold text-slate-300 mb-4">
            {queryStrings.current}
          </span>

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

        <ChartsComponent chart={data.chart} status={status} />
      </div>
    </div>
  );
};

export default ImprovedHome;
