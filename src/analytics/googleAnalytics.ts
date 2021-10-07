import ReactGA from "react-ga";

import { GlobalConfig } from "../types";
import { AnalyticsClient } from "./types";

export class GAAnalyticsClient extends AnalyticsClient {
  constructor(config: GlobalConfig) {
    super(config);
    if (config.googleAnalyticsId) {
      ReactGA.initialize(config.googleAnalyticsId);
    }
  }

  page() {
    if (this._config.googleAnalyticsId) {
      ReactGA.pageview(window.location.pathname);
    }
  }
}
