import { Analytics, AnalyticsBrowser, Context } from "@segment/analytics-next";

import { GlobalConfig } from "../types";
import { AnalyticsClient } from "./types";

export default class SegmentAnalyticsClient extends AnalyticsClient {
  public segmentNativeClient: Analytics | null = null;

  /**
   * initialize the analytics client
   * @param config the configuration
   */
  constructor(config: GlobalConfig) {
    super(config);
    if (config.segmentApiKey) {
      AnalyticsBrowser.load(
        {
          writeKey: config.segmentApiKey,
        },
        {
          retryQueue: true,
        }
      )
        .then((value) => ([this.segmentNativeClient] = value))
        .catch((reason) => {
          console.log(reason);
        });
    }
  }

  page() {
    this.segmentNativeClient?.page();
  }

  identify(userId: string) {
    this.segmentNativeClient?.identify(userId);
  }

  reset() {
    this.segmentNativeClient?.reset();
  }
}
