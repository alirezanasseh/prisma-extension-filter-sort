function removeProperty<T, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const newObj = { ...obj };
  delete newObj[key];
  return newObj;
}

function removeProperties<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const newObj = { ...obj };
  keys.forEach((key) => {
    delete newObj[key];
  });
  return newObj;
}

export const ObjectHelpers = {
  removeProperty,
  removeProperties,
};
