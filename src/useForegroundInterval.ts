import { useCallbackRef } from "@chakra-ui/react";
import React from "react";

import { useIsPollingDisabled } from "./util";

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
      const tick = () => fn();
      intervalId = window.setInterval(tick, intervalMs);
    }
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [intervalMs, fn, isPollingDisabled]);
};

export default useForegroundInterval;
