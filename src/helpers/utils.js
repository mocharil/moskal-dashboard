export const formatNumber = (number) => {
  if (number == null || isNaN(number)) return "0";

  const abs = Math.abs(number);
  const sign = number < 0 ? "-" : "";

  if (abs >= 1_000_000)
    return sign + (abs / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000)
    return sign + (abs / 1_000).toFixed(1).replace(/\.0$/, "") + "K";

  return number.toString();
};
/**
 * Sort an array of objects by a specific key
 * @param {Array} array - array of objects
 * @param {String} key - key to sort by
 * @param {String} order - 'asc' or 'desc'
 */
export const sortByField = (array, key, order = "asc") => {
  const sorted = [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    const aComparable = Array.isArray(aValue) ? aValue.length : aValue;
    const bComparable = Array.isArray(bValue) ? bValue.length : bValue;

    if (aComparable < bComparable) return order === "asc" ? -1 : 1;
    if (aComparable > bComparable) return order === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
};

export const sortByFieldsMultiple = (array, keys) => {
  const sorted = [...array].sort((a, b) => {
    for (let keyConfig of keys) {
      const { key, order = "asc" } =
        typeof keyConfig === "string"
          ? { key: keyConfig, order: "asc" }
          : keyConfig;

      const aValue = a[key];
      const bValue = b[key];

      const aComparable = Array.isArray(aValue) ? aValue.length : aValue;
      const bComparable = Array.isArray(bValue) ? bValue.length : bValue;

      if (aComparable < bComparable) return order === "asc" ? -1 : 1;
      if (aComparable > bComparable) return order === "asc" ? 1 : -1;
      // continue to next key if equal
    }
    return 0; // all keys equal
  });

  return sorted;
};

export const getArrayOfKey = (array, key) => {
  return array.map((item) => item[key]);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export const formatDateAMPM = (dateString) => {
  const date = new Date(dateString?.replace(" ", "T"));

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; // Convert to 12-hour format
  const hourStr = String(hours).padStart(2, "0");

  return `${year}/${month}/${day} ${hourStr}:${minutes} ${ampm}`;
};

export const getLimitArray = (array) => {
  return array.slice(0, 3);
};

export function filterAndDeduplicate(dataArray, filterArray, propertyName) {
  const uniqueValues = new Set();
  const filteredAndDeduplicated = dataArray.filter((item) => {
    const propertyValue = item[propertyName];
    if (
      filterArray.includes(propertyValue) &&
      !uniqueValues.has(propertyValue)
    ) {
      uniqueValues.add(propertyValue);
      return true;
    }
    return false;
  });

  // Sort the filtered array based on the order in filterArray
  filteredAndDeduplicated.sort((a, b) => {
    const indexA = filterArray.indexOf(a[propertyName]);
    const indexB = filterArray.indexOf(b[propertyName]);
    return indexA - indexB;
  });

  return filteredAndDeduplicated;
}
