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
      } ${props.type !== "checkbox" ? "flex-col" : "space-x-2.5"}`}
    >
      {props.label && props.type != null && !/text|number/.test(props.type) && (
        <span className="w-full capitalize">{props.label}</span>
      )}
      <input
        className="w-full rounded px-2 py-1 cursor-pointer placeholder:capitalize"
        ref={inputRef}
        max={props.max}
        min={props.min}
        onChange={handleChange}
        value={props.type !== "checkbox" ? props.value ?? "" : undefined}
        checked={props.type == "checkbox" ? props.value ?? "" : undefined}
        type={props.type ?? "text"}
        placeholder={props.name ?? ""}
      />
    </label>
  );
}
