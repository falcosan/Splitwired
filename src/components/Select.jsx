import React, { useRef } from "react";

export default function Select(props) {
  const selectRef = useRef(null);
  const handleChange = () => {
    props.getSelectValue(selectRef.current.value);
  };
  return (
    <>
      {props.label && <label className="capitalize">{props.label}</label>}
      <select onChange={handleChange} ref={selectRef}>
        {props.options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </>
  );
}
