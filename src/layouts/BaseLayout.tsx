/**
 * @module
 * Base layout and supporting components, like page headers.
 */

import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  chakra,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import * as CSS from "csstype";
import { differenceInDays } from "date-fns";
import * as React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import logo from "../../img/logo-reverse.svg";
import { useAuth } from "../api/auth";
import WhatsNew from "../components/releaseNotes/WhatsNew";
import { SUPPORT_HREF } from "../components/SupportLink";
import EnvironmentSelectField from "./EnvironmentSelect";
import PageFooter from "./PageFooter";
import ProfileDropdown from "./ProfileDropdown";

export interface BaseLayoutProps {
  children?: React.ReactNode;
  overflow?: CSS.Property.Overflow;
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
export const BaseLayout = (props: BaseLayoutProps) => {
  const { overflow, children } = props;

  return (
    <Flex direction="column" height="100vh">
      <NavBar />
      <Container
        as="main"
        maxW="7xl"
        px="5"
        py="3"
        flex={1}
        overflow={overflow}
      >
        {children}
      </Container>
      <PageFooter />
    </Flex>
  );
};

const NavBar = () => {
  const { organization } = useAuth();
  const borderWidth = useColorModeValue("0", "1px");
  const borderColor = useColorModeValue("transparent", "gray.700");

  return (
    <Flex
      justify="space-around"
      bg="purple.900"
      color="white"
      minH="14"
      borderBottom={borderWidth}
      borderColor={borderColor}
    >
      <Flex
        justify={{ base: "flex-start", lg: "space-between" }}
        align="center"
        w="full"
        maxW="7xl"
        px="5"
      >
        <HStack
          as={RouterLink}
          to={organization.platformEnabled ? "/platform/" : "/"}
          mr={2}
          order={2}
          flex={1}
          height="full"
          minWidth={200}
        >
          <VStack
            position="relative"
            flex="0 0 24px"
            mr={{ base: 1, md: 2, lg: 4 }}
          >
            <chakra.img src={logo} height={{ sm: 6, md: 9 }}></chakra.img>
            <WhatsNew
              position="absolute"
              top={{ base: -5, md: -4 }}
              right={{ base: -3, md: -4 }}
            />
          </VStack>
          <VStack spacing="-7px" align="flex-start">
            <Text fontWeight="700" fontSize="md">
              Materialize Cloud
            </Text>
            <Text fontWeight="400" fontSize="sm" color="gray.200">
              open beta
            </Text>
          </VStack>
        </HStack>
        <NavMenu />
        <HStack spacing={{ base: 2, md: 5 }} order={2}>
          <EnvironmentSelectField />
          {organization.trialExpiresAt && (
            <TrialBubble trialExpiresAt={organization.trialExpiresAt} />
          )}
          <HelpDropdown />
          <ProfileDropdown />
        </HStack>
      </Flex>
    </Flex>
  );
};

type NavItem = {
  label: string;
  href: string;
  legacy?: boolean;
};

const platformNavItems: NavItem[] = [
  { label: "Dashboard", href: "/platform" },
  // { label: "Regions", href: "/platform/regions" },
  // { label: "Clusters", href: "/platform/clusters" },
  // { label: "Editor", href: "/platform/editor" },
  { label: "Deployments", href: "/deployments", legacy: true },
];
const legacyNavItems: NavItem[] = [
  { label: "Deployments", href: "/deployments" },
];

const NavMenu = () => {
  const { platformEnabled } = useAuth();
  const navItems = platformEnabled ? platformNavItems : legacyNavItems;
  return (
    <>
      <HStack
        spacing="3"
        flex="2"
        order={2}
        display={{ base: "none", xl: "flex" }}
        alignSelf="stretch"
        alignItems="stretch"
        ml={{ base: 0.5, xl: 2 }}
        mr={{ base: 0.5, xl: 1 }}
      >
        {navItems.map((item) => (
          <NavItem key={`nav-button-${item.label}`} {...item} />
        ))}
      </HStack>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Menu"
          title="Menu"
          icon={<HamburgerIcon />}
          display={{ base: "block", xl: "none" }}
          sx={{
            order: 1,
          }}
          variant="outline"
          mr={{ base: 3, md: 4 }}
        />
        <MenuList>
          {navItems.map((item) => (
            <MenuItem
              as={RouterLink}
              key={`menu-item-${item.label}`}
              to={item.href}
            >
              {item.label}
              {item.legacy && <Badge ml={1}>Legacy</Badge>}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  );
};

const NavItem = (props: NavItem) => {
  const location = useLocation();
  const href = props.href || "#";
  const active = location.pathname === href;
  return (
    <HStack
      as={RouterLink}
      to={href}
      aria-current={active ? "page" : undefined}
      spacing="2"
      px={3}
      transition="all 0.2s"
      color="gray.200"
      _hover={{ bg: "whiteAlpha.200" }}
      _activeLink={{
        bg: "whiteAlpha.300",
        color: "white",
        borderBottom: "3px solid white",
        borderLeft: "3px solid transparent",
        borderRight: "3px solid transparent",
        paddingTop: "3px",
      }}
      borderLeft="3px solid transparent"
      borderRight="3px solid transparent"
    >
      <Box fontWeight="semibold">{props.label}</Box>
      {props.legacy && <Badge>Legacy</Badge>}
    </HStack>
  );
};

const HelpDropdown = () => {
  return (
    <Menu>
      <MenuButton aria-label="Help" title="Help">
        <Box
          bg="white"
          rounded="full"
          h="5"
          w="5"
          color="purple.900"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          ?
        </Box>
      </MenuButton>
      <MenuList>
        <HelpDropdownLink href="https://materialize.com/docs/cloud/">
          Documentation
        </HelpDropdownLink>
        <HelpDropdownLink href="https://materialize.com/s/chat/">
          Join us on Slack
        </HelpDropdownLink>
        <HelpDropdownLink href={SUPPORT_HREF}>Email us</HelpDropdownLink>
      </MenuList>
    </Menu>
  );
};

interface TrialBubble {
  trialExpiresAt: string;
}

const TrialBubble = (props: TrialBubble) => {
  const trialExpiresAt = Date.parse(props.trialExpiresAt);
  const now = Date.now();
  const expired = trialExpiresAt < now;
  const daysRemaining = differenceInDays(trialExpiresAt, now) + 1;
  let daysRemainingText;
  if (expired) {
    daysRemainingText = "Expired";
  } else if (daysRemaining == 1) {
    daysRemainingText = "1 day left";
  } else {
    daysRemainingText = `${daysRemaining} days left`;
  }
  return (
    <HStack
      spacing={{ base: 3, md: 4 }}
      bg={expired ? "red.500" : "whiteAlpha.300"}
      borderRadius="md"
      px={{ sm: 2, md: 3 }}
      py="1"
      fontSize="sm"
      minWidth={180}
    >
      <VStack spacing="-1">
        <Text>Free trial</Text>
        <Text fontWeight="600">{daysRemainingText}</Text>
      </VStack>
      <Link color={expired ? "white" : "blue.200"} href={SUPPORT_HREF}>
        Upgrade
      </Link>
    </HStack>
  );
};

interface HelpDropdownLinkProps {
  href: string;
  children: React.ReactNode;
}

const HelpDropdownLink = (props: HelpDropdownLinkProps) => {
  return (
    <MenuItem as="a" href={props.href} target="_blank" fontWeight="medium">
      {props.children}
    </MenuItem>
  );
};

export interface PageHeaderProps {
  children?: React.ReactNode;
}

/** A container for the header block at the top of a page. */
export const PageHeader = (props: PageHeaderProps) => {
  return <HStack mb="5">{props.children}</HStack>;
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
  return <Box fontSize="md">{props.children || <>&nbsp;</>}</Box>;
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
    <Heading fontWeight="400" fontSize="3xl">
      {props.children}
    </Heading>
  );
};
