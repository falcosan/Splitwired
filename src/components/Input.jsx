import React, { useRef, useCallback } from "react";

export default function Input(props) {
  const inputRef = useRef(null);
  const handleChange = useCallback(() => {
    props.getInputValue(inputRef.current[props.target]);
  }, [inputRef.current]);
  return (
    <>
      <label>
        {props.name}
        <input
          onChange={handleChange}
          ref={inputRef}
          type={props.type}
          placeholder={props.name}
        />
      </label>
    </>
  );
}
