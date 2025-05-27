import Input from "./Input";
import Select from "./Select";
import DatePicker from "./DatePicker";
import React, { useCallback } from "react";

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
  const enhancedGroups = [
    { id: "personal", name: "Personal" },
    { id: "home", name: "Home" },
    ...groups,
  ];

  const getCurrentGroupValue = () => {
    if (parameters.personal) return "personal";
    if (parameters.group === "home") return "home";
    if (parameters.group && parameters.group !== "personal")
      return parameters.group;
    return "personal";
  };

  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const finalValue = type === "checkbox" ? checked : value;
      onParameterChange(name, finalValue);
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
              month: parameters.month || "",
              year: parameters.year || "",
            }}
            onChange={onDateChange}
            label="Select Month & Year"
            minYear={min.year}
            maxYear={max.year}
          />

          <Select
            name="group"
            value={getCurrentGroupValue()}
            label="Group"
            options={enhancedGroups}
            onChange={handleSelectChange}
            className="h-fit"
            hasDefault={true}
          />
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
            name="csv"
            label="Export to CSV"
            type="checkbox"
            checked={parameters.csv || false}
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
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-lg hover:shadow-xl"
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
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
