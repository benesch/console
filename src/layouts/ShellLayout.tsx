import { Box, Center, Flex, Spinner, toCSSVar, VStack } from "@chakra-ui/react";
import { Global, ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { ErrorBoundary } from "@sentry/react";
import React, { PropsWithChildren, useMemo } from "react";

import AccountStatusAlert from "~/components/AccountStatusAlert";
import ErrorBox from "~/components/ErrorBox";
import { darkTheme } from "~/theme";

import NavBar from "./NavBar";
import PageFooter from "./PageFooter";

type ShellLayoutProps = PropsWithChildren;

const MAIN_CONTENT_MARGIN = 4;

/**
 * Since Shell's css variables are scoped within #shell, our 'body' selector with grabs incorrect
 * variables for our font styles. The solution is to declare these styles within scope.
 */
const DEFAULT_FONT_STYLES = {
  color: "var(--ck-colors-chakra-body-text)",
  background: "var(--ck-colors-background-primary)",
};

/**
 * Theme provider so that everything within Shell is in dark mode.
 * Can't reuse Chakra's ThemeProvider since the CSS variables would override the overall app theme's CSS variables.
 * Derived from https://github.com/chakra-ui/chakra-ui/blob/main/packages/core/system/src/providers.tsx
 */
export const ShellThemeProvider = ({ children }: PropsWithChildren) => {
  const computedTheme = useMemo(() => toCSSVar(darkTheme), []);

  return (
    <EmotionThemeProvider theme={computedTheme}>
      <Global
        styles={(theme: any) => ({
          "#shell": { ...theme.__cssVars, ...DEFAULT_FONT_STYLES },
        })}
      />
      {children}
    </EmotionThemeProvider>
  );
};

/**
 * The layout for shell, containing the navigation bar
 * and a sticky footer.
 *
 */
export const ShellLayout = (props: ShellLayoutProps) => {
  return (
    <Flex direction="column" height="100vh">
      <AccountStatusAlert />
      <Flex
        direction={{ base: "column", lg: "row" }}
        flexGrow="1"
        minHeight="0"
      >
        <NavBar />

        <VStack
          flex={1}
          alignItems="stretch"
          spacing={0}
          minWidth="0"
          minHeight="0"
        >
          <ErrorBoundary fallback={<ErrorBox />}>
            <React.Suspense
              fallback={
                <Center css={{ height: "100%" }}>
                  <Spinner />
                </Center>
              }
            >
              <ShellThemeProvider>
                <Box
                  as="main"
                  m={MAIN_CONTENT_MARGIN}
                  borderRadius="lg"
                  id="shell"
                  flex="1"
                  style={{
                    boxShadow: "none", // We set box shadow to none since the theme provider sets its box shadow by default
                  }}
                  minHeight="0"
                  position="relative"
                >
                  {props.children}
                </Box>
              </ShellThemeProvider>
            </React.Suspense>
          </ErrorBoundary>
          <PageFooter />
        </VStack>
      </Flex>
    </Flex>
  );
};
