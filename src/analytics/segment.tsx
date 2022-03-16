import { Analytics } from "@segment/analytics-next";

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
      this.segmentNativeClient = new Analytics({
        writeKey: config.segmentApiKey,
      });
      this.page();
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
