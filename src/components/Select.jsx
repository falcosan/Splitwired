import React, { useRef } from "react";

export default function Select(props) {
  const selectRef = useRef(null);
  const handleChange = () => {
    const value =
      props.label && !selectRef.current.selectedIndex
        ? null
        : selectRef.current.value;
    props.getSelectValue(value);
  };
  return props.options.length ? (
    <select className="cursor-pointer" onChange={handleChange} ref={selectRef}>
      {props.label ? (
        <option key={null} value={null}>
          - {props.label} -
        </option>
      ) : null}
      {props.options.map((option, index) => (
        <option key={option?.id ?? index} value={option?.id ?? index}>
          {option?.name ?? index}
        </option>
      ))}
    </select>
  ) : null;
}
