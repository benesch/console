/**
 * @module
 * Base layout and supporting components, like page headers.
 */

import { Box, Container, Flex, Heading, StackProps } from "@chakra-ui/react";
import * as CSS from "csstype";
import * as React from "react";

import useAvailableEnvironments from "../api/useAvailableEnvironments";
import NavBar, { NAV_LOGO_HEIGHT } from "./NavBar";
import PageFooter from "./PageFooter";

export interface BaseLayoutProps {
  children?: React.ReactNode;
  overflowY?: CSS.Property.Overflow;
}

/**
 * The base layout for logged-in users, containing the navigation bar at the
 * top of the screen and a sticky footer.
 *
 * Pages should generally include `PageHeader` as the first child, but this is
 * not strictly required:
 *
 * ```
 * <BaseLayout>
 *   <PageHeader>
 *     <PageBreadcrumbs>Page / to / page</PageBreadcrumbs>
 *     <PageHeading>Page title here</PageHeading>
 *   </PageHeader>
 * </BaseLayout>
 * ```
 */
export const BaseLayout = ({ overflowY, children }: BaseLayoutProps) => {
  // This populates all environment list and status data for the application,
  // which other components can access via Recoil.
  // Big TODO: wire up recoil somehow so we can do this via the recoil atom directly,
  // rather than having a hook that is only invoked once.
  const _data = useAvailableEnvironments();
  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      maxHeight="100vh"
      minHeight="100vh"
      height="100vh"
      width="100vw"
    >
      <NavBar />
      <Flex direction="column" flex={1} overflowY={overflowY} w="full" h="full">
        <Container flex={1} as="main" maxW="7xl" px={{ base: 4, xl: 6 }} pb={4}>
          <Flex flexDir="column" w="full" h="full">
            {children}
          </Flex>
        </Container>
        <PageFooter />
      </Flex>
    </Flex>
  );
};

/** A container for the header block at the top of a page. */
export const PageHeader = ({ children, ...props }: StackProps) => {
  return (
    <Flex
      minHeight={{ base: 0, lg: NAV_LOGO_HEIGHT }}
      {...props}
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="center"
    >
      {children}
    </Flex>
  );
};

export interface PageBreadcrumbsProps {
  children?: React.ReactNode;
}

/**
 * A container for breadcrumbs.
 *
 * This component should generally be the first child of a `PageHeader`. You
 * should include this component even if the breadcrumbs are empty so that it
 * takes up the right amount of space.
 */
export const PageBreadcrumbs = (props: PageHeadingProps) => {
  // Render a space if no children so that we take up the right amount of space
  // on pages that don't have breadcrumbs.
  return <Box fontSize="sm">{props.children || <>&nbsp;</>}</Box>;
};

export interface PageHeadingProps {
  children?: React.ReactNode;
}

/**
 * A heading at the top of the page.
 *
 * This component should be used inside of a `PageHeader`.
 */
export const PageHeading = (props: PageHeadingProps) => {
  return (
    <Heading fontWeight="400" fontSize="2xl" mt={0} mb={4}>
      {props.children}
    </Heading>
  );
};
