/**
 * @module
 * Base layout and supporting components, like page headers.
 */

import {
  Container,
  Flex,
  Heading,
  HeadingProps,
  HStack,
  StackProps,
  useColorModeValue,
} from "@chakra-ui/react";
import * as CSS from "csstype";
import * as React from "react";

import useAvailableEnvironments from "../api/useAvailableEnvironments";
import { semanticColors } from "../theme/colors";
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
 *     <PageBreadcrumbs crumbs={["page", "to", "page"]} />
 *      { or }
 *     <PageHeading>asdf</PageHeading>
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
        <Container
          flex={1}
          as="main"
          maxW="100%"
          px={{ base: 10, xl: 10 }}
          pb={4}
        >
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

export interface PageHeadingProps extends HeadingProps {
  children?: React.ReactNode;
}

/**
 * A heading at the top of the page.
 *
 * This component should be used inside of a `PageHeader`.
 */
export const PageHeading = ({ children, ...props }: PageHeadingProps) => {
  return (
    <Heading fontWeight="500" fontSize="2xl" my={0} {...props}>
      {children}
    </Heading>
  );
};

export interface PageBreadcrumbsProps {
  crumbs: string[];
}

/**
 * A container for breadcrumbs.
 * This goes inside a PageHeader for a header that is a series of paths.
 */
export const PageBreadcrumbs = ({ crumbs }: PageBreadcrumbsProps) => {
  const grayText = useColorModeValue(
    semanticColors.grayText.light,
    semanticColors.grayText.dark
  );
  // Render a space if no children so that we take up the right amount of space
  // on pages that don't have breadcrumbs.
  return (
    <HStack>
      {crumbs.map((crumb, i: number) => {
        const isLast = i === crumbs.length - 1;
        return (
          <PageHeading
            key={`crumb-${crumb}-${i}`}
            color={isLast ? "default" : grayText}
            fontWeight={500}
          >
            {`${crumb}${isLast ? "" : " / "}`}
          </PageHeading>
        );
      })}
    </HStack>
  );
};
