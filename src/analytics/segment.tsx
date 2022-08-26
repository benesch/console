import {
  Analytics,
  AnalyticsBrowser,
  SegmentEvent,
} from "@segment/analytics-next";

import { GlobalConfig } from "../config";
import { AnalyticsClient } from "./types";

// We buffer up and queue events for the Segment SDK's `.push()`
// method, which takes a method name and the payload for it
type QueuedEvent = [string, Partial<SegmentEvent>];

export class Buffer {
  public queue: QueuedEvent[] = [];

  // NOTE: taken from the signature of `analytics-next`'s Analytics.page method
  page(args?: {
    category?: string;
    name?: string;
    properties?: { [k: string]: any };
  }) {
    const opts = args || {};
    if (!opts.properties?.path) {
      opts.properties = opts.properties || {};
      opts.properties.path = window.location.pathname;
    }
    this.queue.push(["page", opts]);
  }

  identify(userId: string) {
    this.queue.push(["identify", { userId }]);
  }

  reset() {
    // should be idempotent
  }

  push(e: QueuedEvent) {
    this.queue.push(e);
  }

  replaceWith(c: Analytics) {
    this.queue.forEach(c.push, c);
    this.queue = [];
  }
}

export default class SegmentAnalyticsClient extends AnalyticsClient {
  public segmentNativeClient: Analytics | Buffer = new Buffer();

  /**
   * initialize the analytics client
   * @param config the configuration
   */
  constructor(config: GlobalConfig) {
    super(config);
    if (config.segmentApiKey) {
      const settings = {
        writeKey: config.segmentApiKey,
      };
      const options = {
        retryQueue: true,
      };
      AnalyticsBrowser.load(settings, options)
        .then(([analytics, _ctx]) => {
          const buffer = this.segmentNativeClient as Buffer;
          this.segmentNativeClient = analytics;
          // this.segmentNativeClient.debug(true);
          buffer.replaceWith(this.segmentNativeClient);
        })
        .catch((reason) => {
          console.error(reason);
        });
    }
  }

  page(args?: {
    category?: string;
    name?: string;
    properties?: { [k: string]: any };
  }) {
    this.segmentNativeClient?.page(args);
  }

  identify(userId: string) {
    this.segmentNativeClient?.identify(userId);
  }

  reset() {
    this.segmentNativeClient?.reset();
  }
}
