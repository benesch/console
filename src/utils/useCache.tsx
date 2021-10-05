import { useEffect, useRef } from "react";

/**
 * a react compatible cache for a value
 * @param value
 * @returns
 */
export const useCache = <T,>(value: T): T | undefined => {
  // we use a ref because it does not cause a rerender when the inner value changes
  const cache = useRef<T | undefined>(value);

  const setCache = (value: T) => {
    cache.current = value;
  };

  useEffect(() => {
    // if a new value is emitted, updates local cache
    if (value) {
      setCache(value);
    }
  }, [value]);

  return cache.current;
};
