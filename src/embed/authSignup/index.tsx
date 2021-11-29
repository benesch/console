import { Box } from "@chakra-ui/layout";
import { css } from "@chakra-ui/system";
import { Global } from "@emotion/react";
import { AuthPlugin, SignUp } from "@frontegg/react-auth";
import { FronteggProvider } from "@frontegg/react-core";
import * as React from "react";

import { domHandler } from "./dom";
import { baseFronteggTheme, localFronteggSignupStyles } from "./styles";

export const EmbeddableAuthSignupPage = () => {
  domHandler.use();
  return (
    <>
      <Global styles={css(localFronteggSignupStyles)}></Global>
      <FronteggProvider
        context={{
          baseUrl: window.CONFIG.fronteggUrl,
          theme: baseFronteggTheme,
        }}
        plugins={[AuthPlugin()]}
      >
        <Box height="100vh">
          <SignUp />
        </Box>
      </FronteggProvider>
    </>
  );
};
