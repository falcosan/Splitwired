import React, { useRef } from "react";

export default function Input(props) {
  const inputRef = useRef(null);
  const handleChange = () => {
    props.getInputValue(inputRef.current[props.target]);
  };
  return (
    <label
      className={`flex ${props.type !== "checkbox" ? "flex-col" : "space-x-1"}`}
    >
      {props.label && <span className="capitalize">{props.label}</span>}
      <input
        onChange={handleChange}
        ref={inputRef}
        type={props.type}
        placeholder={props.name}
      />
    </label>
  );
}
