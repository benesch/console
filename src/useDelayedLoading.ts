import React from "react";

/**
 * Delays loading for the specified timeout.
 * @returns boolean indicating whether or not to show a loading state
 */
const useDelayedLoading = (loading: boolean, delayMs = 1_000) => {
  const [showLoading, setShowLoading] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (!showLoading && loading) {
      timeoutRef.current = setTimeout(() => {
        setShowLoading(true);
      }, delayMs);
    }
    return () => {
      // clear the timeout if anything changes before it fires
      clearTimeout(timeoutRef.current);
    };
  }, [showLoading, loading, delayMs]);

  if (showLoading && !loading) {
    setShowLoading(false);
  }

  return showLoading;
};

export default useDelayedLoading;
