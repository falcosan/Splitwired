import React from "react";

const DatePicker = ({
  value,
  onChange,
  label = "Date",
  minYear = 2020,
  maxYear = new Date().getFullYear(),
  className = "",
}) => {
  const currentDate = new Date();
  const selectedMonth = value?.month || "";
  const selectedYear = value?.year || "";

  const months = [
    { value: "", label: "All months" },
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = [{ value: "", label: "All time" }];
  for (let year = minYear; year <= maxYear; year++) {
    years.push({ value: year, label: year.toString() });
  }

  const handleMonthChange = (e) => {
    const month = e.target.value;
    onChange({
      month: month === "" ? null : parseInt(month),
      year: selectedYear === "" ? null : selectedYear,
    });
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    const month =
      year === "" ? null : selectedMonth === "" ? null : selectedMonth;
    onChange({
      month: month,
      year: year === "" ? null : parseInt(year),
    });
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <label className="text-stone-300 font-medium">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          disabled={selectedYear === "" || selectedYear === null}
          className={`flex-1 rounded-lg px-3 py-2 md:px-4 md:py-3 border text-sm md:text-base transition-all duration-200 focus:outline-none
                     ${
                       selectedYear === "" || selectedYear === null
                         ? "bg-stone-600 border-stone-500 text-stone-400 cursor-not-allowed"
                         : "bg-stone-700 border-stone-600 text-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 cursor-pointer hover:border-stone-500"
                     }`}
        >
          {months.map((month) => (
            <option
              key={month.value}
              value={month.value}
              className="bg-stone-700 text-stone-200"
            >
              {month.label}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="sm:w-24 md:w-28 rounded-lg px-3 py-2 md:px-4 md:py-3 bg-stone-700 border border-stone-600 text-stone-200 
                     focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 focus:outline-none
                     transition-all duration-200 cursor-pointer hover:border-stone-500 text-sm md:text-base"
        >
          {years.map((year) => (
            <option
              key={year.value || "all"}
              value={year.value}
              className="bg-stone-700 text-stone-200"
            >
              {year.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DatePicker;
