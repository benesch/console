import NativeSegmentClient from "@segment/analytics.js-core/build/analytics";
import SegmentIntegration from "@segment/analytics.js-integration-segmentio";

import { GlobalConfig } from "../types";
import { AnalyticsClient } from "./types";

export class SegmentAnalyticsClient extends AnalyticsClient {
  public segmentNativeClient: NativeSegmentClient | null = null;

  /**
   * initialize the analytics client
   * @param config the configuration
   */
  constructor(config: GlobalConfig) {
    super(config);
    if (config.segmentApiKey) {
      this.segmentNativeClient = new NativeSegmentClient();
      this.segmentNativeClient.use(SegmentIntegration);
      this.segmentNativeClient.initialize({
        "Segment.io": {
          apiKey: config.segmentApiKey,
          retryQueue: true,
          addBundledMetadata: true,
        },
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
