/**
 * useDebounce Hook
 * Custom hook for debounced values
 */

import { useState, useEffect } from "react";
import { DURATIONS } from "../utils/constants";

export const useDebounce = (value, delay = DURATIONS.DEBOUNCE_DELAY) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
