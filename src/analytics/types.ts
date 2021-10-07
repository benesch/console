import { GlobalConfig } from "../types";

/**
 * A generic analytics event emitter
 */
export abstract class AnalyticsClient {
  constructor(protected _config: GlobalConfig) {}
  abstract page(): void;
}
