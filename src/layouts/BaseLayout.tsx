/**
 * @module
 * Base layout and supporting components, like page headers.
 */

import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  BoxProps,
  Center,
  Container,
  Flex,
  Heading,
  HeadingProps,
  HStack,
  Spinner,
  StackProps,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import * as CSS from "csstype";
import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { NavLink, NavLinkProps } from "react-router-dom";

import SupportLink from "~/components/SupportLink";
import NavBar from "~/layouts/NavBar";
import PageFooter from "~/layouts/PageFooter";

export interface BaseLayoutProps {
  children?: React.ReactNode;
  overflowY?: CSS.Property.Overflow;
}

export const MAIN_CONTENT_MARIGIN = 10;

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
          px={MAIN_CONTENT_MARIGIN}
          pb={4}
        >
          <Flex flexDir="column" w="full" h="full">
            <ErrorBoundary
              FallbackComponent={GenericError}
              onReset={() => {
                // reset the state of your app so the error doesn't happen again
              }}
            >
              <React.Suspense
                fallback={
                  <Center css={{ height: "100%" }}>
                    <Spinner />
                  </Center>
                }
              >
                {children}
              </React.Suspense>
            </ErrorBoundary>
          </Flex>
        </Container>
        <PageFooter />
      </Flex>
    </Flex>
  );
};

export const GenericError = () => {
  return (
    <Flex h="100%" w="100%" alignItems="center" justifyContent="center">
      <VStack spacing={2}>
        <Alert status="error" rounded="md" p={4} marginTop={2}>
          <AlertIcon />
          An unexpected error has occured
        </Alert>
        <Text>
          <SupportLink>Contact support</SupportLink> if the issue persists.
        </Text>
      </VStack>
    </Flex>
  );
};

/** A container for the header block at the top of a page. */
export const PageHeader = ({ children, ...props }: StackProps) => {
  return (
    <Flex
      my="6"
      {...props}
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="center"
      width="100%"
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
    <Heading
      lineHeight="32px"
      fontWeight="500"
      fontSize="2xl"
      my={0}
      {...props}
    >
      {children}
    </Heading>
  );
};

export interface PageBreadcrumbsProps {
  crumbs: string[];
  children?: React.ReactNode;
}

/**
 * A container for breadcrumbs.
 * This goes inside a PageHeader for a header that is a series of paths.
 */
export const PageBreadcrumbs = ({ crumbs, children }: PageBreadcrumbsProps) => {
  const { colors } = useTheme();
  // Render a space if no children so that we take up the right amount of space
  // on pages that don't have breadcrumbs.
  return (
    <HStack>
      {crumbs.map((crumb, i: number) => {
        const isLast = i === crumbs.length - 1;
        return (
          <PageHeading
            key={`crumb-${crumb}-${i}`}
            color={
              isLast ? "default" : colors.semanticColors.foreground.secondary
            }
            fontWeight={500}
          >
            {`${crumb}${isLast ? "" : " / "}`}
          </PageHeading>
        );
      })}
      {children}
    </HStack>
  );
};

export interface PageTabStripProps {
  children: React.ReactNode;
}

export const PageTabStrip = ({ children }: PageTabStripProps) => {
  const { space } = useTheme();
  const mainContentMargin = space[MAIN_CONTENT_MARIGIN];

  return (
    <HStack
      width={`calc(100% + ${mainContentMargin} * 2)`}
      style={{ marginLeft: `-${mainContentMargin}` }}
      px={mainContentMargin}
      borderBottom="solid 1px"
      borderColor="semanticColors.border.primary"
      spacing={10}
    >
      {children}
    </HStack>
  );
};

export type PageTabProps = NavLinkProps & {
  children: React.ReactNode;
  tabProps?: BoxProps;
};
export const PageTab = (props: PageTabProps) => {
  const { colors } = useTheme();
  const { children, tabProps, ...navLinkProps } = props;

  return (
    <NavLink
      style={({ isActive }) =>
        isActive
          ? {
              borderBottom: `solid 1px ${colors.semanticColors.accent.purple}`,
              marginBottom: "-1px",
            }
          : undefined
      }
      {...navLinkProps}
    >
      <Box
        lineHeight="20px"
        fontSize="14px"
        fontWeight="500"
        pb={2}
        {...tabProps}
      >
        {children}
      </Box>
    </NavLink>
  );
};

export type ExpandablePanelProps = BoxProps & {
  text: string;
  children: React.ReactNode;
};

export const ExpandablePanel = ({
  text,
  children,
  ...boxProps
}: ExpandablePanelProps) => {
  const [show, setShow] = React.useState(false);

  return (
    <Box>
      <Box
        color="semanticColors.accent.brightPurple"
        fontSize="xs"
        cursor="pointer"
        onClick={() => setShow(!show)}
        {...boxProps}
      >
        {text}
        {show ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </Box>
      {show && children}
    </Box>
  );
};
