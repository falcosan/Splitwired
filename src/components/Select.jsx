import React from "react";

const Select = ({
  name,
  value,
  onChange,
  label,
  options = [],
  className = "",
  ...props
}) => {
  if (!options.length) return null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {label && (
        <label className="text-slate-300 font-medium capitalize">{label}</label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="rounded-lg px-3 py-2 md:px-4 md:py-3 bg-slate-700 border border-slate-600 text-slate-200 
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none
                   transition-all duration-200 cursor-pointer hover:border-slate-500 text-sm md:text-base"
        {...props}
      >
        <option value="" className="bg-slate-700 text-slate-400">
          - Select {label || "Option"} -
        </option>
        {options.map((option, index) => (
          <option
            key={option?.id ?? index}
            value={option?.id ?? index}
            className="bg-slate-700 text-slate-200"
          >
            {option?.name ?? option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
