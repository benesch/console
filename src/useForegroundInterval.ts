import { useCallbackRef } from "@chakra-ui/react";
import React from "react";

import { Results } from "./api/materialized";
import { useIsPollingDisabled } from "./recoil/focus";

/**
 * Executes a callback at the specified interval while the document has focus.
 * When the document regains focus, the callback will be called immediately, and then on the specified interval.
 */
const useForegroundInterval = (
  callback: () => void,
  intervalMs: number | null = 5000
) => {
  const isPollingDisabled = useIsPollingDisabled();
  const fn = useCallbackRef(callback);
  const [pollingWasDisabled, setPollingWasDisabled] =
    React.useState(isPollingDisabled);

  React.useEffect(() => {
    setPollingWasDisabled(isPollingDisabled || !intervalMs);
  }, [isPollingDisabled, intervalMs]);

  React.useEffect(() => {
    // If we just enabled polling after it was paused, call the callback immediately
    // so we update state as soon possible, rather than waiting for the timeout.
    if (!isPollingDisabled && pollingWasDisabled && intervalMs) {
      fn();
    }
  }, [fn, intervalMs, isPollingDisabled, pollingWasDisabled]);

  React.useEffect(() => {
    let intervalId: number | null = null;
    if (!isPollingDisabled && intervalMs !== null) {
      intervalId = window.setInterval(fn, intervalMs);
    }
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [intervalMs, fn, isPollingDisabled]);
};

export default useForegroundInterval;

/**
 * Executes the refetch function at the specified interval only if not currently loading.
 * Build on useForegroundInterval, the interval only runs when the document is focused.
 * @returns boolean indicating if the callback is currently running
 */
export const usePoll = (
  loading: boolean,
  refetch: () => Promise<Results[] | null | undefined>,
  intervalMs: number | null = 5000
) => {
  const loadingRef = React.useRef(loading);
  const [isPolling, setIsPolling] = React.useState(false);
  React.useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const fn = React.useCallback(async () => {
    if (!loadingRef.current) {
      setIsPolling(true);
      await refetch();
      setIsPolling(false);
    }
  }, [refetch]);

  useForegroundInterval(fn, intervalMs);

  return isPolling;
};
