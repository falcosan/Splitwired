import React, { useRef } from "react";

export default function Input(props) {
  const inputRef = useRef(null);
  const handleChange = () => {
    props.getInputValue(inputRef.current[props.target]);
  };
  return (
    <label
      className={`flex items-baseline cursor-pointer ${
        props.className ?? null
      } ${props.type !== "checkbox" ? "flex-col" : "space-x-1"}`}
    >
      {props.label && <span className="w-full capitalize">{props.label}</span>}
      <input
        className={`w-full ${!props.label ? "cursor-pointer" : null}`}
        ref={inputRef}
        max={props.max}
        min={props.min}
        onChange={handleChange}
        value={props.value ?? ""}
        type={props.type ?? "text"}
        placeholder={props.name ?? ""}
      />
    </label>
  );
}
