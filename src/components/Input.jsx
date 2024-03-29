import React, { useRef } from "react";

export default function Input(props) {
  const inputRef = useRef(null);
  const handleChange = () => {
    props.getInputValue(inputRef.current[props.target] || null);
  };
  return (
    <label
      onClick={props.onClick}
      className={`flex items-center cursor-pointer ${props.className ?? null} ${
        props.type !== "checkbox" ? "flex-col" : "space-x-2.5"
      } ${!/checkbox|button|submit/.test(props.type) ? "h-8" : null}`}
    >
      {props.label && props.type != null && /checkbox|button|submit/.test(props.type) && (
        <span className="w-full capitalize text-slate-300">{props.label}</span>
      )}
      <input
        className={`rounded px-2 py-1 placeholder:capitalize ${
          !/checkbox|button|submit/.test(props.type) ? "w-full h-full" : null
        } ${!props.disabled ? "cursor-pointer" : null}`}
        ref={inputRef}
        max={props.max}
        min={props.min}
        onChange={handleChange}
        disabled={props.disabled}
        type={props.type ?? "text"}
        placeholder={props.name ?? ""}
        value={props.type !== "checkbox" ? props.value ?? "" : undefined}
        checked={props.type == "checkbox" ? props.value ?? "" : undefined}
      />
    </label>
  );
}
