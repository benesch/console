import { GlobalConfig } from "../types";

/**
 * A generic analytics event emitter
 */
export abstract class AnalyticsClient {
  constructor(protected _config: GlobalConfig) {}
  abstract page(): void;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  identify(_userId: string): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reset(): void {}
}
