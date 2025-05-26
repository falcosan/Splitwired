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
    rounded px-3 py-2 border transition-colors
    ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}
    ${type === "checkbox" ? "w-4 h-4" : "w-full"}
    ${
      type !== "checkbox"
        ? "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        : ""
    }
  `.trim();

  const labelClasses = `
    flex items-center gap-2 font-medium text-slate-300
    ${type === "checkbox" ? "flex-row cursor-pointer" : "flex-col"}
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
