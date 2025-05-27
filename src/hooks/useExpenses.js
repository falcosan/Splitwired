import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import api from "@/api";

export const useExpenses = () => {
  const min = { year: 2020, month: 1 };
  const max = { year: new Date().getFullYear(), month: 12 };

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloads, setDownloads] = useState("");
  const [data, setData] = useState({
    data: [],
    table: [],
    chart: [],
    groups: [],
  });
  const [parameters, setParameters] = useState({
    csv: false,
    month: new Date().getMonth() + 1,
    year: max.year,
    group: null,
    personal: true,
    chart: ["pie", "bar"],
    category: null,
  });

  const currentState = useRef({
    year: parameters.year,
    month: parameters.month,
    group: parameters.group,
    category: parameters.category,
    personal: parameters.personal,
  });

  const properties = useMemo(() => {
    let idKey, totalKey, numberKey;
    data.table.forEach((item) => {
      for (const prop in item) {
        const lowerCaseProp = prop.toLowerCase();
        if (lowerCaseProp.includes("id")) idKey = prop;
        if (lowerCaseProp.includes("total")) totalKey = prop;
        if (lowerCaseProp.includes("number")) numberKey = prop;
      }
    });
    return { id: idKey, total: totalKey, number: numberKey };
  }, [data.table]);

  const categoryCheck = useMemo(() => {
    return String(parameters.group) === String(currentState.current.group);
  }, [parameters.group]);

  const categories = useMemo(() => {
    if (
      data.data.length &&
      categoryCheck &&
      String(parameters.year) === String(currentState.current.year) &&
      String(parameters.month) === String(currentState.current.month)
    ) {
      return data.data
        .map((item) => item.category)
        .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    return [];
  }, [data.data, categoryCheck, parameters.year, parameters.month]);

  const expenses = useMemo(() => {
    const isPersonal = parameters.personal;

    if (!parameters.category) {
      return data.table.map((item, index) => ({
        ...item,
        [properties.number || "number"]: index + 1,
      }));
    }

    const found = categories.find(
      (item) => String(item.id) === String(parameters.category)
    );
    const filters = found
      ? data.data.filter((item) => item.category.name === found.name)
      : data.data;

    let total = 0;
    return data.table
      .filter((item) =>
        filters.map((item) => item.id).includes(item[properties.id])
      )
      .map((item, index) => {
        total += Number(filters[index][isPersonal ? "user_cost" : "cost"]);
        return {
          ...item,
          [properties.number || "number"]: index + 1,
          [properties.total || "total"]: total.toLocaleString("en", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: false,
          }),
        };
      });
  }, [
    data.data,
    data.table,
    parameters.category,
    parameters.personal,
    categories,
    properties,
  ]);

  const summaryInfo = useMemo(() => {
    if (data.data.length > 0) {
      const isPersonal = parameters.personal;
      const costKey = isPersonal ? "user_cost" : "cost";

      let filteredData = data.data;
      if (parameters.category) {
        const found = categories.find(
          (item) => String(item.id) === String(parameters.category)
        );
        if (found) {
          filteredData = data.data.filter(
            (item) => item.category.name === found.name
          );
        }
      }

      const total = filteredData.reduce((acc, item) => {
        return acc + Number(item[costKey] || 0);
      }, 0);

      const averageDivider = filteredData.length || 1;

      return {
        total: total.toLocaleString("en", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: false,
        }),
        average: (total / averageDivider).toLocaleString("en", {
          useGrouping: false,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };
    }
    return null;
  }, [
    data.data,
    data.groups,
    parameters.personal,
    parameters.category,
    parameters.month,
    parameters.year,
    categories,
  ]);

  const buildApiPayload = useCallback((searchParams) => {
    return {
      personal: searchParams.personal || false,
      month: searchParams.month || null,
      year: searchParams.year || null,
      group: searchParams.group || null,
      chart: searchParams.chart || ["pie", "bar"],
      category: searchParams.category || null,
      csv: searchParams.csv || false,
    };
  }, []);

  const initializeData = useCallback(async () => {
    setLoading(true);
    setStatus("Loading");
    try {
      const [groups, downloads] = await Promise.all([
        api.getGroups(),
        api.getDownloads(),
      ]);
      setData((prev) => ({ ...prev, groups }));
      setDownloads(downloads);
      setStatus("Ready");
    } catch (error) {
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExpenses = useCallback(
    async (formData = null) => {
      const searchParams = formData || parameters;
      setStatus("Loading");

      currentState.current = {
        year: searchParams.year,
        month: searchParams.month,
        group: searchParams.group,
        category: searchParams.category,
        personal: searchParams.personal,
      };

      setData((prev) => ({ ...prev, data: [], table: [], chart: [] }));

      try {
        const apiPayload = buildApiPayload(searchParams);

        const {
          data: expenseData,
          table,
          chart,
        } = await api.getExpenses(apiPayload);

        if (expenseData) {
          if (table && chart) {
            setData((prev) => ({ ...prev, data: expenseData, table, chart }));
          }
          setStatus(expenseData.length ? "" : "No expenses");

          if (expenseData.length && searchParams.csv) {
            setLoading(true);
            try {
              const csvPayload = { ...apiPayload, csv: true };
              await api.getExpenses(csvPayload);
              const newDownloads = await api.getDownloads();
              setDownloads(newDownloads);
            } finally {
              setLoading(false);
            }
          }

          if (searchParams.category) {
            setParameters((prev) => ({ ...prev, category: null }));
          }
        } else {
          setStatus("Error");
        }
      } catch (error) {
        setStatus("Error");
      }
    },
    [parameters, buildApiPayload]
  );

  const updateParameters = useCallback((updates) => {
    setParameters((prev) => {
      const newParams = { ...prev, ...updates };

      if (updates.hasOwnProperty("group")) {
        newParams.personal =
          updates.group === "personal" || updates.group === null;
      }

      return newParams;
    });
  }, []);

  const handleDateChange = useCallback(
    (dateValue) => {
      updateParameters({
        month: dateValue.month === "" ? null : parseInt(dateValue.month),
        year: dateValue.year === "" ? null : parseInt(dateValue.year),
      });
    },
    [updateParameters]
  );

  useEffect(() => {
    if (parameters.category) {
      setParameters((prev) => ({ ...prev, category: null }));
    }
  }, [categories.length]);

  return {
    status,
    loading,
    downloads,
    data,
    parameters,
    expenses,
    categories,
    summaryInfo,
    min,
    max,
    setParameters: updateParameters,
    handleDateChange,
    initializeData,
    fetchExpenses,
    properties,
    categoryCheck,
  };
};
