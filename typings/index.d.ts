declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: string;
  export default src;
}

declare module "@segment/analytics.js-integration-segmentio";

declare module "@segment/analytics.js-core/build/analytics" {
  declare class Analytics {
    initialize(any);
    use(any);
    page();
    identify(string);
    reset();
  }
  export default Analytics;
}
