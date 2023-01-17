import { useLayoutEffect } from "react";

export const useRemovesNullClass = () => {
  useLayoutEffect(() => {
    const nodesNull = document.querySelectorAll(".null");
    if (nodesNull.length) {
      nodesNull.forEach((node) => node.classList.remove("null"));
    }
  }, []);
};
