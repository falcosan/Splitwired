export const importFilter = (data, filters, rule) => {
  if (rule) {
    return Object.fromEntries(
      Object.entries(data).filter(([k]) =>
        new RegExp(Array.isArray(filters) ? filters.join("|") : filters).test(k)
      )
    );
  } else {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([k]) =>
          !new RegExp(
            Array.isArray(filters) ? filters.join("|") : filters
          ).test(k)
      )
    );
  }
};
