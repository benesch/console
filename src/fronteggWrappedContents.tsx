import { useColorMode } from "@chakra-ui/color-mode";
import { FronteggProvider } from "@frontegg/react";
import React from "react";

import logo from "../img/wordmark.svg";
import { RestfulProvider } from "./api/auth";
import EmbeddedLoading from "./embed/EmbeddedLoading";
import { useIsInIframe } from "./embed/utils";
import LoadingScreen from "./loading";
import Router from "./router";
import {
  fronteggAuthPageBackground,
  fronteggCustomStyles,
  getFronteggTheme,
} from "./theme";

type Props = {
  baseUrl: string;
};

const FronteggWrappedContents = ({ baseUrl }: Props) => {
  const isEmbedded = useIsInIframe();
  const [loading, setLoading] = React.useState(true);
  const { colorMode } = useColorMode();
  const theme = React.useMemo(() => {
    return getFronteggTheme(colorMode);
  }, [colorMode]);

  return (
    <>
      <FronteggProvider
        contextOptions={{ baseUrl }}
        authOptions={{
          routes: {
            authenticatedUrl: "/deployments",
          },
        }}
        headerImage={logo}
        backgroundImage={fronteggAuthPageBackground}
        themeOptions={theme}
        customStyles={fronteggCustomStyles}
        customLoader={setLoading}
      >
        <RestfulProvider>
          <Router />
        </RestfulProvider>
      </FronteggProvider>
      {loading ? isEmbedded ? <EmbeddedLoading /> : <LoadingScreen /> : null}
    </>
  );
};

export default FronteggWrappedContents;
