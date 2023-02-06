import { AnalyticsBrowser } from "@segment/analytics-next";

import config from "~/config";

const segment = new AnalyticsBrowser();

if (config.segmentApiKey) {
  segment.load(
    {
      writeKey: config.segmentApiKey,
    },
    {
      retryQueue: true,
    }
  );
}

export default segment;
