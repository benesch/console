import ReactGA from "react-ga";

import { GlobalConfig } from "../config";
import { AnalyticsClient } from "./types";

export default class GAAnalyticsClient extends AnalyticsClient {
  constructor(config: GlobalConfig) {
    super(config);
    if (config.googleAnalyticsId) {
      ReactGA.initialize(config.googleAnalyticsId);
      this.page();
    }
  }

  page() {
    if (this._config.googleAnalyticsId) {
      ReactGA.pageview(window.location.pathname);
    }
  }
}
