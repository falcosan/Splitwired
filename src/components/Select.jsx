import React, { useRef } from "react";

export default function Select(props) {
  const selectRef = useRef(null);
  const handleChange = () => {
    props.getSelectValue(selectRef.current.value);
  };
  return props.options.length ? (
    <>
      {props.label && <label className="capitalize">{props.label}</label>}
      <select
        className="cursor-pointer"
        onChange={handleChange}
        ref={selectRef}
      >
        {props.options.map((option, index) => (
          <option key={option.id ?? index} value={option.id ?? index}>
            {option.name ?? index}
          </option>
        ))}
      </select>
    </>
  ) : null;
}
