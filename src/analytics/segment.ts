import {
  AnalyticsBrowser,
  Callback,
  EventProperties,
  Options,
  SegmentEvent,
} from "@segment/analytics-next";

import { useCurrentOrganization } from "~/api/auth";
import config from "~/config";

export const segment = new AnalyticsBrowser();

if (config.segmentApiKey) {
  segment.load(
    {
      writeKey: config.segmentApiKey,
    },
    {
      integrations: {
        // Use the Materialize-specific Segment proxy, which is less likely to
        // be on public ad blocking lists.
        "Segment.io": {
          apiHost: "api.segment.materialize.com/v1",
        },
      },
      retryQueue: true,
    }
  );
}

/*
 * A React hook that returns a user-aware Segment client.
 *
 * The returned Segment client functions like Segment's standard
 * `AnalyticsBrowser` client, but calls to `track` attach the current
 * organization ID to the event.
 */
export function useSegment() {
  const { organization } = useCurrentOrganization();

  const track = (
    eventName: string | SegmentEvent,
    properties?: EventProperties | Callback | undefined,
    options?: Callback | Options | undefined,
    callback?: Callback | undefined
  ) => {
    segment.track(
      eventName,
      properties,
      {
        groupId: organization?.id,
        ...options,
      },
      callback
    );
  };

  return { track };
}
