import React, { useCallback } from "react";
import DatePicker from "./DatePicker";
import Input from "./Input";
import Select from "./Select";

const FormComponent = ({
  parameters,
  onParameterChange,
  onDateChange,
  onSubmit,
  status,
  groups = [],
  categories = [],
  min,
  max,
}) => {
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      onParameterChange(name, value);
    },
    [onParameterChange]
  );

  const handleSelectChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      onParameterChange(name, value);
    },
    [onParameterChange]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit();
    },
    [onSubmit]
  );

  const isLoading = status === "Loading";

  return (
    <div className="bg-slate-800 rounded-lg p-4 md:p-6 shadow-lg border border-slate-700">
      <h2 className="text-xl md:text-2xl font-semibold text-slate-200 mb-4 md:mb-6 flex items-center gap-2">
        Filter Options
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <DatePicker
            value={{
              month: parameters.month,
              year: parameters.year,
            }}
            onChange={onDateChange}
            label="Select Month & Year"
            minYear={min.year}
            maxYear={max.year}
          />

          {groups.length > 0 && (
            <Select
              name="group"
              value={parameters.group || ""}
              label="Group"
              options={groups}
              onChange={handleSelectChange}
              className="h-fit"
            />
          )}
        </div>

        {categories.length > 0 && (
          <Select
            name="category"
            value={parameters.category || ""}
            label="Category"
            options={categories}
            onChange={handleSelectChange}
          />
        )}

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <Input
            name="personal"
            label="Personal Expenses"
            type="checkbox"
            checked={parameters.personal}
            onChange={handleInputChange}
          />

          <Input
            name="csv"
            label="Export to CSV"
            type="checkbox"
            checked={parameters.csv}
            onChange={handleInputChange}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform
            ${
              isLoading
                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg hover:shadow-xl"
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Searching...
            </span>
          ) : (
            "Search Expenses"
          )}
        </button>
      </form>
    </div>
  );
};

export default FormComponent;
