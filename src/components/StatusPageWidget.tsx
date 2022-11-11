/**
 * @module
 * Statuspage.io widget.
 *
 * Based on https://qf52z1jnw4q8.statuspage.io/embed/script.js but adapted for
 * React. The NPM package [0] is appealing on first glance, but is not nearly as
 * full-featured as the iframe we embed here.
 *
 * [0]: https://www.npmjs.com/package/@statuspage/status-widget
 */

import { chakra } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";

export type StatusPageWidgetProps = {
  id: string;
};

const StatusPageWidget = (props: StatusPageWidgetProps) => {
  const mobile = screen.width < 450;
  const origin = `https://${props.id}.statuspage.io`;
  const iframeRef = useRef(null);
  const [visible, setVisible] = useState(false);

  let src = `${origin}/embed/frame`;
  if (mobile) {
    src += `?mobile=true`;
  }

  const handleIframeMessage = React.useCallback(
    (event: MessageEvent) => {
      if (event.origin !== origin) {
        return;
      }

      switch (event.data.action) {
        case "showFrame":
          setVisible(true);
          break;

        case "dismissFrame":
          setVisible(false);
          break;

        case undefined:
          // no-op - sometimes this is sent on initial load
          break;

        default:
          throw new Error(
            `unexpected action from statuspage iframe: ${event.data.action}`
          );
      }
    },
    [origin]
  );

  useEffect(() => {
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [handleIframeMessage]);

  return (
    <chakra.iframe
      ref={iframeRef}
      src={src}
      position="fixed"
      border="none"
      boxShadow="0 20px 32px -8px rgba(9,20,66,0.25)"
      zIndex="9999"
      transition={mobile ? "bottom 1s ease" : "left 1s ease"}
      height={mobile ? "20vh" : "115px"}
      width={mobile ? "100vw" : "320px"}
      right={mobile ? "0px" : visible ? "60px" : "-9999px"}
      bottom={mobile ? (visible ? "0" : "-9999px") : "60px"}
    />
  );
};

export default StatusPageWidget;
