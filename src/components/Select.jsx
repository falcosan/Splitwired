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
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-slate-300 font-medium capitalize">{label}</label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="rounded px-3 py-2 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors cursor-pointer"
        {...props}
      >
        <option value="">- Select {label || "Option"} -</option>
        {options.map((option, index) => (
          <option key={option?.id ?? index} value={option?.id ?? index}>
            {option?.name ?? option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
