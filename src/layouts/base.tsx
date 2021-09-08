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
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AdminPortal, useAuth } from "@frontegg/react";
import * as React from "react";
import { Link, useHistory } from "react-router-dom";

import logo from "../../img/logo-reverse.svg";

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

      <Box
        bg="white"
        color="gray.500"
        textAlign="center"
        py="3"
        fontWeight="400"
        fontSize="sm"
        boxShadow="footer"
      >
        © {new Date().getFullYear()} Materialize
      </Box>
    </Flex>
  );
}

function NavBar() {
  return (
    <Flex justify="space-around" bg="purple.600" color="white" minH="14">
      <Flex justify="space-between" align="center" w="full" maxW="7xl" px="5">
        <HStack as={Link} to="/" mr="3rem">
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
          <NavItem active label="Deployments" href="/deployments" />
        </HStack>

        <HStack spacing="5">
          <HelpDropdown />
          <ProfileDropdown />
        </HStack>
      </Flex>
    </Flex>
  );
}

interface NavItemProps {
  href?: string;
  active?: boolean;
  label: string;
}

function NavItem(props: NavItemProps) {
  return (
    <HStack
      as={Link}
      to={props.href || "#"}
      aria-current={props.active ? "page" : undefined}
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
        <HelpDropdownLink href="mailto:support@materialize.com">
          Email us
        </HelpDropdownLink>
      </MenuList>
    </Menu>
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
