import React from "react";

const Select = ({
  name,
  value,
  onChange,
  label,
  options = [],
  className = "",
  hasDefault = false,
  ...props
}) => {
  if (!options.length) return null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {label && (
        <label className="text-stone-300 font-medium capitalize">{label}</label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="rounded-lg px-3 py-2 md:px-4 md:py-3 bg-stone-700 border border-stone-600 text-stone-200 
                   focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 focus:outline-none
                   transition-all duration-200 cursor-pointer hover:border-stone-500 text-sm md:text-base"
        {...props}
      >
        {!hasDefault && (
          <option value="" className="bg-stone-700 text-stone-400">
            - Select {label || "Option"} -
          </option>
        )}
        {options.map((option, index) => (
          <option
            key={option?.id ?? index}
            value={option?.id ?? index}
            className="bg-stone-700 text-stone-200"
          >
            {option?.name ?? option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
