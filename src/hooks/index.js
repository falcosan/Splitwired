import { useEffect, useCallback } from "react";

export const useMutationObserver = (node, callback, options) => {
  useEffect(() => {
    const targetNode = document.querySelector(node);
    const observer = new MutationObserver(callback);
    if (targetNode) observer.observe(targetNode, options);
    return () => observer.disconnect();
  }, [node, callback, options]);
};

export const useRemovesNullClass = () => {
  const handler = useCallback(() => {
    const nodesNull = document.querySelectorAll(".null");
    if (nodesNull.length) {
      nodesNull.forEach((node) => node.classList.remove("null"));
    }
  }, []);
  useMutationObserver("html", handler, { attributes: true, subtree: true });
};
