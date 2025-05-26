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
  const selectedMonth = value?.month
    ? parseInt(value.month)
    : currentDate.getMonth() + 1;
  const selectedYear = value?.year
    ? parseInt(value.year)
    : currentDate.getFullYear();

  const months = [
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

  const years = [];
  for (let year = minYear; year <= maxYear; year++) {
    years.push(year);
  }

  const handleMonthChange = (e) => {
    const month = e.target.value;
    onChange({
      month: month,
      year: selectedYear.toString(),
    });
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    onChange({
      month: selectedMonth.toString(),
      year: year,
    });
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-slate-300 font-medium capitalize">{label}</label>
      <div className="flex gap-2">
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="flex-1 rounded px-3 py-2 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="w-24 rounded px-3 py-2 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DatePicker;
