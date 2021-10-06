/**
 * @module
 * Base layout and supporting components, like page headers.
 */

import {
  Avatar,
  Box,
  chakra,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AdminPortal } from "@frontegg/react";
import { differenceInDays } from "date-fns";
import * as React from "react";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";

import logo from "../../img/logo-reverse.svg";
import { useAuth } from "../api/auth";
import { SUPPORT_HREF } from "../components/cta";
import { PageFooter } from "../components/footer";
import { assert } from "../util";

export interface BaseLayoutProps {
  children?: React.ReactNode;
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
export function BaseLayout(props: BaseLayoutProps) {
  return (
    <Flex direction="column" height="100vh">
      <NavBar />
      <Box as="main" py="3" flex="1">
        <Container maxW="7xl" px="5">
          {props.children}
        </Container>
      </Box>
      <PageFooter />
    </Flex>
  );
}

function NavBar() {
  const { organization } = useAuth();
  return (
    <Flex justify="space-around" bg="purple.600" color="white" minH="14">
      <Flex justify="space-between" align="center" w="full" maxW="7xl" px="5">
        <HStack as={RouterLink} to="/" mr="3rem">
          <chakra.img src={logo} height="9" mr="4"></chakra.img>
          <VStack spacing="-7px" align="left">
            <Text fontWeight="700" fontSize="md">
              Materialize Cloud
            </Text>
            <Text fontWeight="400" fontSize="sm" color="gray.300">
              open beta
            </Text>
          </VStack>
        </HStack>

        <HStack
          spacing="3"
          flex="1"
          display="flex"
          alignSelf="stretch"
          alignItems="stretch"
        >
          {organization.admitted ? (
            <NavItem label="Deployments" href="/deployments" />
          ) : (
            <NavItem label="Welcome" href="/welcome" />
          )}
        </HStack>

        <HStack spacing="5">
          {organization.admitted && organization.trialExpiresAt && (
            <TrialBubble trialExpiresAt={organization.trialExpiresAt} />
          )}
          <HelpDropdown />
          <ProfileDropdown />
        </HStack>
      </Flex>
    </Flex>
  );
}

interface NavItemProps {
  href?: string;
  label: string;
}

function NavItem(props: NavItemProps) {
  const location = useLocation();
  const href = props.href || "#";
  const active = location.pathname.startsWith(href);
  return (
    <HStack
      as={RouterLink}
      to={href}
      aria-current={active ? "page" : undefined}
      spacing="2"
      px="6"
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
    >
      <Box fontWeight="semibold">{props.label}</Box>
    </HStack>
  );
}

function HelpDropdown() {
  return (
    <Menu>
      <MenuButton bg="white" rounded="full" h="5" w="5" color="purple.900">
        ?
      </MenuButton>
      <MenuList rounded="md" shadow="lg" py="1" color="gray.600" fontSize="sm">
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
}

interface TrialBubble {
  trialExpiresAt: string;
}

function TrialBubble(props: TrialBubble) {
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
      spacing="4"
      bg={expired ? "red.500" : "whiteAlpha.300"}
      borderRadius="md"
      px="3"
      py="1"
      fontSize="sm"
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
}

interface HelpDropdownLinkProps {
  href: string;
  children: React.ReactNode;
}

function HelpDropdownLink(props: HelpDropdownLinkProps) {
  return (
    <MenuItem as="a" href={props.href} target="_blank" fontWeight="medium">
      {props.children}
    </MenuItem>
  );
}

function ProfileDropdown() {
  const history = useHistory();
  const { user, routes: authRoutes } = useAuth();

  assert(user); // This component is only rendered for logged-in users.

  return (
    <Menu>
      <MenuButton>
        <Avatar
          size="sm"
          src={user.profilePictureUrl || user.profileImage}
          name={user.name}
        />
      </MenuButton>
      <MenuList rounded="md" shadow="lg" py="1" color="gray.600" fontSize="sm">
        <VStack px="3" pt="4" pb="2" align="left" lineHeight="1.3" spacing="0">
          <Text fontWeight="semibold">{user.name}</Text>
          <Text mt="1" fontSize="xs" color="gray.500">
            {user.email}
          </Text>
        </VStack>
        <MenuDivider />
        <MenuItem fontWeight="medium" onClick={() => AdminPortal.show()}>
          Account settings
        </MenuItem>
        <MenuItem
          fontWeight="medium"
          color="red.500"
          onClick={() => history.push(authRoutes.logoutUrl)}
        >
          Sign out
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

export interface PageHeaderProps {
  children?: React.ReactNode;
}

/** A container for the header block at the top of a page. */
export function PageHeader(props: PageHeaderProps) {
  return <HStack mb="5">{props.children}</HStack>;
}

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
export function PageBreadcrumbs(props: PageHeadingProps) {
  // Render a space if no children so that we take up the right amount of space
  // on pages that don't have breadcrumbs.
  return <Box fontSize="md">{props.children || <>&nbsp;</>}</Box>;
}

export interface PageHeadingProps {
  children?: React.ReactNode;
}

/**
 * A heading at the top of the page.
 *
 * This component should be used inside of a `PageHeader`.
 */
export function PageHeading(props: PageHeadingProps) {
  return (
    <Heading fontWeight="400" fontSize="2xl">
      {props.children}
    </Heading>
  );
}
