import React from "react";

const Input = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  checked,
  disabled = false,
  min,
  max,
  placeholder,
  className = "",
  ...props
}) => {
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    onChange({
      target: {
        name,
        value: type === "checkbox" ? checked : value,
      },
    });
  };

  const inputClasses = `
    rounded-lg transition-all duration-200
    ${disabled ? "bg-slate-600 cursor-not-allowed text-slate-500" : ""}
    ${
      type === "checkbox"
        ? "w-4 h-4 sm:w-5 sm:h-5 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
        : `w-full px-3 py-2 sm:px-4 sm:py-3 bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-400 
         focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none text-sm sm:text-base`
    }
  `.trim();

  const labelClasses = `
    flex gap-3 font-medium text-slate-300
    ${
      type === "checkbox"
        ? "flex-row items-center cursor-pointer hover:text-slate-200"
        : "flex-col"
    }
    ${className}
  `.trim();

  return (
    <label className={labelClasses}>
      {label && type !== "checkbox" && (
        <span className="capitalize">{label}</span>
      )}

      <input
        name={name}
        type={type}
        value={type !== "checkbox" ? value || "" : undefined}
        checked={type === "checkbox" ? checked : undefined}
        onChange={handleChange}
        disabled={disabled}
        min={min}
        max={max}
        placeholder={placeholder || (type !== "checkbox" ? name : "")}
        className={inputClasses}
        {...props}
      />

      {label && type === "checkbox" && (
        <span className="capitalize">{label}</span>
      )}
    </label>
  );
};

export default Input;
