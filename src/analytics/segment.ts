import { AnalyticsBrowser } from "@segment/analytics-next";

import config from "~/config";

const segment = new AnalyticsBrowser();

if (config.segmentApiKey) {
  segment.load(
    {
      writeKey: config.segmentApiKey,
    },
    {
      integrations: {
        "Segment.io": {
          // proxies to https://api.segment.io/v1
          apiHost: "api.segment.materialize.com/v1",
        },
      },
      retryQueue: true,
    }
  );
}

export default segment;
