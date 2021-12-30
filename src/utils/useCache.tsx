import { useEffect, useState } from "react";

/**
 * a react compatible cache for a value
 * @param value
 * @returns
 */
const useCache = <T,>(value: T): T | undefined => {
  // we use a ref because it does not cause a rerender when the inner value changes
  const [cache, setCache] = useState<T | undefined>(value);

  useEffect(() => {
    // if a new value is emitted, updates local cache
    if (value) {
      setCache(value);
    }
  }, [value]);

  return cache;
};

export default useCache;
