export const saveToLocalStorage = (key, value, days) => {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + days * 24 * 60 * 60 * 1000, // Expiry in milliseconds
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const loadFromLocalStorage = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};
