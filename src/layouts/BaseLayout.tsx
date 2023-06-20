/**
 * @module
 * Base layout and supporting components, like page headers.
 */

import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";
import {
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
  StyleProps,
  useTheme,
} from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import * as CSS from "csstype";
import * as React from "react";
import { Link } from "react-router-dom";
import { NavLink, NavLinkProps } from "react-router-dom";

import AccountStatusAlert from "~/components/AccountStatusAlert";
import EnvironmentError from "~/components/EnvironmentError";
import ErrorBox from "~/components/ErrorBox";
import NavBar from "~/layouts/NavBar";
import PageFooter from "~/layouts/PageFooter";
import { MaterializeTheme } from "~/theme";

export interface BaseLayoutProps {
  children?: React.ReactNode;
  overflowY?: CSS.Property.Overflow;
  /** Hides content and displays the environment error when the current environment is unhealthy. Defaults to true. */
  hideContentOnEnvironmentError?: boolean;
}

export const MAIN_CONTENT_MARGIN = 10;

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
export const BaseLayout = ({ overflowY, ...props }: BaseLayoutProps) => {
  const hideContentOnEnvironmentError =
    props.hideContentOnEnvironmentError ?? true;
  return (
    <Flex direction="column" minHeight="100vh">
      <AccountStatusAlert />
      <Flex direction={{ base: "column", lg: "row" }} flexGrow="1">
        <NavBar />
        <Flex
          direction="column"
          flex={1}
          overflowY={overflowY}
          minHeight="100vh"
        >
          <Container
            flex={1}
            as="main"
            maxW="100%"
            px={MAIN_CONTENT_MARGIN}
            pb={4}
            bg="semanticColors.background.primary"
          >
            <Flex flexDir="column" w="full" h="full">
              <ErrorBoundary fallback={<ErrorBox />}>
                <React.Suspense
                  fallback={
                    <Center css={{ height: "100%" }}>
                      <Spinner />
                    </Center>
                  }
                >
                  <EnvironmentError
                    hideContentOnEnvironmentError={
                      hideContentOnEnvironmentError
                    }
                  >
                    {props.children}
                  </EnvironmentError>
                </React.Suspense>
              </ErrorBoundary>
            </Flex>
          </Container>
          <PageFooter />
        </Flex>
      </Flex>
    </Flex>
  );
};

/** A container for the header block at the top of a page. */
export const PageHeader = ({ children, ...props }: StackProps) => {
  return (
    <Flex
      my="6"
      flexDirection="row"
      alignItems="flex-start"
      justifyContent="space-between"
      width="100%"
      {...props}
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
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <Heading
      fontSize="2xl"
      lineHeight="32px"
      color={semanticColors.foreground.primary}
      fontWeight="500"
      my={0}
      {...props}
    >
      {children}
    </Heading>
  );
};

export interface Breadcrumb {
  title: string;
  href?: string;
}

export interface PageBreadcrumbsProps {
  crumbs: Breadcrumb[];
  children?: React.ReactNode;
}

/**
 * A container for breadcrumbs.
 * This goes inside a PageHeader for a header that is a series of paths.
 */
export const PageBreadcrumbs = ({ crumbs, children }: PageBreadcrumbsProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  // Render a space if no children so that we take up the right amount of space
  // on pages that don't have breadcrumbs.
  return (
    <HStack spacing={0}>
      {crumbs.map((crumb, i: number) => {
        const isLast = i === crumbs.length - 1;
        return (
          <PageHeading
            key={crumb.title}
            color={
              isLast ? "default" : colors.semanticColors.foreground.secondary
            }
            fontWeight={500}
          >
            <>
              {crumb.href ? (
                <Link to={crumb.href}>{crumb.title}</Link>
              ) : (
                crumb.title
              )}
              {isLast ? null : <ChevronRightIcon />}
            </>
          </PageHeading>
        );
      })}
      {children}
    </HStack>
  );
};

type Tab = { label: string; href: string };
export interface PageTabStripProps {
  tabData: Tab[];
}

export const PageTabStrip = ({ tabData }: PageTabStripProps) => {
  const {
    colors: { semanticColors },
    space,
  } = useTheme<MaterializeTheme>();
  const mainContentMargin = space[MAIN_CONTENT_MARGIN];

  const [tabBoundingBox, setTabBoundingBox] = React.useState<DOMRect | null>(
    null
  );
  const [wrapperBoundingBox, setWrapperBoundingBox] =
    React.useState<DOMRect | null>(null);
  const [highlightedTab, setHighlightedTab] = React.useState<Tab | null>(null);
  const [isHoveredFromNull, setIsHoveredFromNull] = React.useState(true);

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const highlightRef = React.useRef(null);

  const repositionHighlight = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tab: Tab
  ) => {
    setTabBoundingBox((e.target as HTMLElement).getBoundingClientRect());
    setWrapperBoundingBox(wrapperRef.current!.getBoundingClientRect());
    setIsHoveredFromNull(!highlightedTab);
    setHighlightedTab(tab);
  };

  const resetHighlight = () => setHighlightedTab(null);

  const highlightStyles = {} as StyleProps;

  if (tabBoundingBox && wrapperBoundingBox) {
    highlightStyles.transitionDuration = isHoveredFromNull ? "0ms" : "150ms";
    highlightStyles.opacity = highlightedTab ? 1 : 0;
    highlightStyles.width = `${tabBoundingBox.width}px`;
    highlightStyles.transform = `translate(${
      tabBoundingBox.left - wrapperBoundingBox.left
    }px)`;
  }

  return (
    <HStack
      ref={wrapperRef}
      onMouseLeave={resetHighlight}
      position="relative"
      width={`calc(100% + ${mainContentMargin} * 2)`}
      style={{ marginLeft: `-${mainContentMargin}` }}
      px={10}
      borderBottom="solid 1px"
      borderColor="semanticColors.border.primary"
      spacing={4}
    >
      <Box
        ref={highlightRef}
        background={semanticColors.background.secondary}
        position="absolute"
        top="9px"
        left={0}
        borderRadius="4px"
        height="32px"
        transition="0.15ms ease"
        transitionProperty="opacity, width, transform"
        {...highlightStyles}
      />
      {tabData.map((tab) => (
        <PageTab
          to={tab.href}
          key={tab.label}
          onMouseOver={(e) => repositionHighlight(e, tab)}
        >
          {tab.label}
        </PageTab>
      ))}
    </HStack>
  );
};

export type PageTabProps = NavLinkProps & {
  children: React.ReactNode;
  tabProps?: BoxProps;
};
export const PageTab = (props: PageTabProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const { children, tabProps, ...navLinkProps } = props;

  return (
    <NavLink
      style={({ isActive }) =>
        isActive
          ? {
              borderBottom: `solid 1px ${semanticColors.accent.purple}`,
              marginBottom: "-1px",
            }
          : undefined
      }
      end={true}
      {...navLinkProps}
    >
      <Box
        {...tabProps}
        color={semanticColors.foreground.primary}
        p="16px 12px"
        lineHeight="16px"
        fontSize="14px"
        fontWeight="500"
        display="inline-block"
        position="relative"
        cursor="pointer"
        transition="color 250ms"
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
    <Box width="100%">
      <Box
        color="semanticColors.accent.brightPurple"
        fontSize="xs"
        cursor="pointer"
        userSelect="none"
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
