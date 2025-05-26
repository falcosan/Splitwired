export const buildQueryString = (
  params,
  groups = [],
  categories = [],
  min,
  max
) => {
  const { year, month, group, category, personal } = params;

  const getGroupName = () => {
    if (personal) return "Personal";
    if (group === "home") return "Home";
    if (group) {
      const found = groups.find((g) => String(g.id) === String(group));
      return found ? found.name : "";
    }
    return "Personal";
  };

  const getCategoryName = () => {
    if (category) {
      const found = categories.find((c) => String(c.id) === String(category));
      return found ? ` - ${found.name}` : "";
    }
    return "";
  };

  const getMonthName = () => {
    if (year === null || year === "" || !year) {
      return "";
    }

    if (
      month &&
      month !== null &&
      month !== "" &&
      month >= min.month &&
      month <= max.month
    ) {
      const date = new Date();
      date.setMonth(month - 1);
      return ` - ${date.toLocaleString("en", { month: "long" })}`;
    }
    if (month === null || month === "" || !month) {
      return " - All months";
    }
    return "";
  };

  const getYearString = () => {
    if (
      year &&
      year !== null &&
      year !== "" &&
      +year >= min.year &&
      +year <= max.year
    ) {
      return ` - ${year}`;
    }
    if (year === null || year === "" || !year) {
      return " - All time";
    }
    return "";
  };

  const groupName = getGroupName();
  const categoryName = getCategoryName();
  const monthName = getMonthName();
  const yearString = getYearString();

  return `${groupName}${categoryName}${monthName}${yearString}`.trim();
};
