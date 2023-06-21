import {
  Box,
  Center,
  Flex,
  Spinner,
  ThemeProvider,
  VStack,
} from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import React, { PropsWithChildren } from "react";

import AccountStatusAlert from "~/components/AccountStatusAlert";
import EnvironmentError from "~/components/EnvironmentError";
import ErrorBox from "~/components/ErrorBox";
import { darkTheme } from "~/theme";

import NavBar from "./NavBar";
import PageFooter from "./PageFooter";

type ShellLayoutProps = PropsWithChildren;

const MAIN_CONTENT_MARGIN = 4;

/**
 * The layout for shell, containing the navigation bar at the
 * and a sticky footer.
 *
 * Pages should generally include `PageHeader` as the first child, but this is
 * not strictly required:
 *
 * ```
 * <ShellLayout>
 *   <PageHeader>
 *     <PageBreadcrumbs crumbs={["page", "to", "page"]} />
 *      { or }
 *     <PageHeading>asdf</PageHeading>
 *   </PageHeader>
 * </ShellLayout>
 * ```
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

        <VStack flex={1} alignItems="stretch" spacing={0}>
          <ThemeProvider theme={darkTheme}>
            <Box
              flex={1}
              as="main"
              m={MAIN_CONTENT_MARGIN}
              bg="semanticColors.background.primary"
              minHeight="0"
              borderRadius="lg"
            >
              <Flex flexDir="column" w="100%" h="100%">
                <ErrorBoundary fallback={<ErrorBox />}>
                  <React.Suspense
                    fallback={
                      <Center css={{ height: "100%" }}>
                        <Spinner />
                      </Center>
                    }
                  >
                    <EnvironmentError hideContentOnEnvironmentError>
                      {props.children}
                    </EnvironmentError>
                  </React.Suspense>
                </ErrorBoundary>
              </Flex>
            </Box>
          </ThemeProvider>
          <PageFooter />
        </VStack>
      </Flex>
    </Flex>
  );
};
