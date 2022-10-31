/**
 * @module
 * Nav bar for base layout, because the file was getting too big.
 */

import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  BoxProps,
  chakra,
  Flex,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { differenceInDays } from "date-fns";
import * as React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import logo from "../../img/logo-reverse.svg";
import { useAuth } from "../api/auth";
import WhatsNew from "../components/releaseNotes/WhatsNew";
import { SUPPORT_HREF } from "../components/SupportLink";
import EnvironmentSelectField from "./EnvironmentSelect";
import ProfileDropdown, {
  AVATAR_WIDTH,
  ProfileMenuItems,
} from "./ProfileDropdown";

export const NAV_HORIZONTAL_SPACING = 4;
export const NAV_HOVER_STYLES = { bg: "whiteAlpha.200" };
export const NAV_LOGO_HEIGHT = "72px";

const NavBar = () => {
  const { organization } = useAuth();
  const borderWidth = useColorModeValue("0", "1px");
  const borderColor = useColorModeValue("transparent", "gray.700");

  return (
    <Flex
      direction={{ base: "row", lg: "column" }}
      justify="flex-start"
      align={{ base: "center", lg: "stretch" }}
      pb={{ base: 0, lg: 2 }}
      bg="purple.900"
      color="white"
      minH={{ base: "auto", lg: "full" }}
      minW="240px"
      borderRightWidth={{ base: 0, lg: borderWidth }}
      borderBottomWidth={{ base: borderWidth, lg: 0 }}
      borderColor={borderColor}
    >
      <HStack
        as={RouterLink}
        to="/"
        mx={0}
        px={NAV_HORIZONTAL_SPACING}
        flex={0}
        width="full"
        justifyContent="flex-start"
        minHeight={{ base: "auto", lg: NAV_LOGO_HEIGHT }}
        order={1}
      >
        <NavMenuCompact
          display={{ base: "block", lg: "none" }}
          trialExpiresAt={organization.trialExpiresAt}
        />
        <VStack
          position="relative"
          flex="0 0 24px"
          mr={{ base: 1, md: 2, lg: 0 }}
          ml={0}
        >
          <chakra.img
            src={logo}
            height={{ base: 6, md: 9 }}
            aria-label="Logo"
          ></chakra.img>
          <WhatsNew
            position="absolute"
            top={{ base: -5, md: -4 }}
            right={{ base: -3, md: -4 }}
          />
        </VStack>
        <Text fontWeight="700" fontSize="md">
          Materialize
        </Text>
      </HStack>
      <Flex
        flex={0}
        minH={{ base: "auto", lg: "54px" }}
        alignItems="flex-start"
        justifyContent="stretch"
        px={NAV_HORIZONTAL_SPACING}
        pb={{ base: 0, lg: 2 }}
        order={{ base: 100, lg: 2 }}
      >
        <EnvironmentSelectField />
      </Flex>
      <NavMenu
        order={{ base: 2, lg: 3 }}
        display={{ base: "none", lg: "flex" }}
      />
      <Spacer order={{ base: 3, lg: 4 }} />
      <Flex
        order={4}
        direction={{ base: "row", lg: "column" }}
        align={{ base: "center", lg: "stretch" }}
        fontSize="sm"
      >
        {organization.trialExpiresAt && (
          <TrialBubble
            display={{ base: "none", lg: "flex" }}
            trialExpiresAt={organization.trialExpiresAt}
            mx={NAV_HORIZONTAL_SPACING}
            my={{ base: 0, lg: 2 }}
          />
        )}
        <HelpDropdown />
        <ProfileDropdown width="100%" display={{ base: "none", lg: "flex" }} />
      </Flex>
    </Flex>
  );
};

type NavItemType = {
  label: string;
  href: string;
};

const getNavItems = (isInternal: boolean): NavItemType[] => {
  const gatedItems: NavItemType[] = isInternal
    ? [
        { label: "Clusters", href: "/clusters" },
        { label: "Editor", href: "/editor" },
      ]
    : [];
  return [
    { label: "Connect", href: "/" },
    ...gatedItems,
    {
      label: "Docs",
      href: "//materialize.com/docs/get-started/",
    },
  ];
};

const NavMenu = (props: BoxProps) => {
  const { user } = useAuth();
  const navItems = React.useMemo(
    () => getNavItems(user.email.endsWith("@materialize.com")),
    [user.email]
  );

  return (
    <VStack
      data-test-id="nav-lg"
      spacing="0"
      flex="2"
      alignSelf="stretch"
      alignItems="stretch"
      mt={0}
      mb={{ base: 0.5, xl: 1 }}
      {...props}
    >
      {navItems.map((item) => (
        <NavItem key={`nav-button-${item.label}`} {...item} />
      ))}
    </VStack>
  );
};

type NavMenuCompactProps = MenuButtonProps & {
  trialExpiresAt: string | null;
};

const NavMenuCompact = ({ trialExpiresAt, ...props }: NavMenuCompactProps) => {
  const { user } = useAuth();
  const navItems = React.useMemo(
    () => getNavItems(user.email.endsWith("@materialize.com")),
    [user.email]
  );

  return (
    <Menu data-test-id="nav-sm">
      <MenuButton
        as={IconButton}
        aria-label="Menu"
        title="Menu"
        icon={<HamburgerIcon />}
        display={{ base: "block", xl: "none" }}
        variant="outline"
        mr={2}
        {...props}
      />
      <MenuList>
        {navItems.map((item) => (
          <MenuItem
            as={RouterLink}
            key={`menu-item-${item.label}`}
            to={item.href}
          >
            {item.label}
          </MenuItem>
        ))}
        <ProfileMenuItems />
        {trialExpiresAt && (
          <Box p={2} display={{ base: "flex", lg: "none" }}>
            <TrialBubble trialExpiresAt={trialExpiresAt} flex={1} />
          </Box>
        )}
      </MenuList>
    </Menu>
  );
};

const NavItem = (props: NavItemType) => {
  const location = useLocation();
  const href = props.href || "#";
  const active = location.pathname === href;

  const linkContents = (
    <HStack
      aria-current={active ? "page" : undefined}
      spacing="2"
      width="full"
      px={NAV_HORIZONTAL_SPACING}
      py={2}
      transition="all 0.2s"
      color="gray.200"
      _hover={NAV_HOVER_STYLES}
      _activeLink={{
        bg: "whiteAlpha.300",
        color: "white",
        paddingLeft: "3px",
        borderTop: "3px solid transparent",
        borderBottom: { base: "3px solid white", lg: "3px solid transparent" },
        borderLeft: { base: "3px solid transparent", lg: 0 },
        borderRight: { base: "3px solid transparent", lg: "3px solid white" },
        px: 4,
      }}
      borderTop="3px solid transparent"
      borderBottom="3px solid transparent"
    >
      <Box fontWeight="semibold">{props.label}</Box>
    </HStack>
  );

  /* react-router-dom doesn't support external links, amazingly */
  if (href.search("//") === -1) {
    return (
      <HStack as={RouterLink} to={href}>
        {linkContents}
      </HStack>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {linkContents}
    </a>
  );
};

const HelpDropdown = () => {
  return (
    <Menu>
      <MenuButton
        aria-label="Help"
        title="Help"
        _hover={NAV_HOVER_STYLES}
        px={NAV_HORIZONTAL_SPACING}
        py={2}
      >
        <HStack>
          {/* The wrapper box keeps the centers of the circles aligned */}
          <Flex
            h={AVATAR_WIDTH}
            w={AVATAR_WIDTH}
            justifyContent="center"
            alignItems="center"
          >
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
          </Flex>
          <Text>Help</Text>
        </HStack>
      </MenuButton>
      <MenuList>
        <HelpDropdownLink href="https://materialize.com/docs/">
          Documentation
        </HelpDropdownLink>
        <HelpDropdownLink href="https://materialize.com/s/chat">
          Join us on Slack
        </HelpDropdownLink>
        <HelpDropdownLink href={SUPPORT_HREF}>Email us</HelpDropdownLink>
      </MenuList>
    </Menu>
  );
};

type TrialBubble = BoxProps & {
  trialExpiresAt: string;
};

const TrialBubble = ({ trialExpiresAt, ...props }: TrialBubble) => {
  // This color logic is a mess because if it's size lg, it's always dark
  // (menu bg varies by colormode, but the regular nav always has a dark bg)
  const textColor = useColorModeValue("default", "white");
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const linkColor = useColorModeValue("blue.600", "blue.200");
  const trialExpireTime = Date.parse(trialExpiresAt);
  const now = Date.now();
  const expired = trialExpireTime < now;
  const daysRemaining = differenceInDays(trialExpireTime, now) + 1;
  let daysRemainingText;
  if (expired) {
    daysRemainingText = "Expired";
  } else if (daysRemaining === 1) {
    daysRemainingText = "1 day left";
  } else {
    daysRemainingText = `${daysRemaining} days left`;
  }
  return (
    <Flex
      bg={expired ? "red.500" : { base: bgColor, lg: "gray.800" }}
      borderRadius="md"
      px={2}
      py={1}
      fontSize="sm"
      minWidth={180}
      justify="center"
      alignItems="center"
      {...props}
    >
      <VStack
        spacing="-1"
        flex={1}
        color={expired ? "white" : { base: textColor, lg: "white" }}
      >
        <Text>Free trial</Text>
        <Text
          fontWeight="600"
          color={
            expired
              ? "white"
              : textColor !== "white"
              ? { base: "black", lg: "white" }
              : "default"
          }
        >
          {daysRemainingText}
        </Text>
      </VStack>
      <Link
        color={expired ? "white" : { base: linkColor, lg: "blue.200" }}
        href={SUPPORT_HREF}
        textAlign="center"
        flex={1}
      >
        Upgrade
      </Link>
    </Flex>
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

export default NavBar;
