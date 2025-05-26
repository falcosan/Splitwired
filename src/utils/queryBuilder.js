export const buildQueryString = (
  params,
  groups = [],
  categories = [],
  min,
  max
) => {
  const { year, month, group, category } = params;

  const getGroupName = () => {
    if (group === "personal") return "Personal";
    if (group === "home") return "Home";
    if (group) {
      const found = groups.find((g) => String(g.id) === String(group));
      return found ? found.name : "";
    }
    return "Personal"; // Default fallback
  };

  const getCategoryName = () => {
    if (category) {
      const found = categories.find((c) => String(c.id) === String(category));
      return found ? ` - ${found.name}` : "";
    }
    return "";
  };

  const getMonthName = () => {
    if (month && month >= min.month && month <= max.month) {
      const date = new Date();
      date.setMonth(month - 1);
      return ` - ${date.toLocaleString("en", { month: "long" })}`;
    }
    return "";
  };

  const getYearString = () => {
    if (year && +year >= min.year && +year <= max.year) {
      return ` - ${year}`;
    }
    return "";
  };

  const groupName = getGroupName();
  const categoryName = getCategoryName();
  const monthName = getMonthName();
  const yearString = getYearString();

  return `${groupName}${categoryName}${monthName}${yearString}`.trim();
};
