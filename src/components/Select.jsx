import React, { useRef } from "react";

export default function Select(props) {
  const selectRef = useRef(null);
  const handleChange = () => {
    const value =
      props.label && !selectRef.current.selectedIndex
        ? null
        : selectRef.current.value;
    props.getSelectValue(value || null);
  };
  return props.options.length ? (
    <select
      className={`h-8 rounded px-2 py-1 cursor-pointer ${
        props.className ?? null
      }`}
      onChange={handleChange}
      ref={selectRef}
    >
      {props.label ? <option value="">- {props.label} -</option> : null}
      {props.options.map((option, index) => (
        <option key={option?.id ?? index} value={option?.id ?? index}>
          {option?.name ?? index}
        </option>
      ))}
    </select>
  ) : null;
}
