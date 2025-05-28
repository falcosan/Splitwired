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
    ${disabled ? "bg-stone-600 cursor-not-allowed text-stone-500" : ""}
    ${
      type === "checkbox"
        ? "w-4 h-4 md:w-5 md:h-5 text-emerald-600 bg-stone-700 border-stone-600 focus:ring-emerald-500 focus:ring-2 cursor-pointer"
        : `w-full px-3 py-2 md:px-4 md:py-3 bg-stone-700 border border-stone-600 text-stone-200 placeholder-stone-400 
         focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 focus:outline-none text-sm md:text-base`
    }
  `.trim();

  const labelClasses = `
    flex gap-3 font-medium text-stone-300
    ${
      type === "checkbox"
        ? "flex-row items-center cursor-pointer hover:text-stone-200"
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
