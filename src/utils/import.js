export const importFilter = (data, filters, rule, strict = false) => {
  const filterFn = (k) => {
    if (Array.isArray(filters)) {
      return rule ? filters.every((filter) => k === filter) : filters.every((filter) => k !== filter);
    } else {
      return rule ? k === filters : k !== filters;
    }
  };
  return Object.entries(data).reduce((acc, [k, v]) => {
    if (filterFn(k)) {
      acc[k] = v;
    }
    return acc;
  }, {});
};