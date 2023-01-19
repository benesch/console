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
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
  Spacer,
  Spinner,
  Tag,
  Text,
  useColorMode,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import * as React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { SUPPORT_HREF } from "~/components/SupportLink";
import blackLogo from "~/img/logo-black.svg";
import whiteLogo from "~/img/logo-white.svg";
import EnvironmentSelectField from "~/layouts/EnvironmentSelect";
import ProfileDropdown, {
  AVATAR_WIDTH,
  ProfileMenuItems,
} from "~/layouts/ProfileDropdown";
import { useRegionSlug } from "~/region";
import { MaterializeTheme } from "~/theme";

export const NAV_HORIZONTAL_SPACING = 4;
export const NAV_HOVER_STYLES = {
  bg: "semanticColors.background.tertiary",
};
export const NAV_LOGO_HEIGHT = "80px";

const NavBar = () => {
  const { colors } = useTheme<MaterializeTheme>();
  const { colorMode } = useColorMode();

  return (
    <Flex
      direction={{ base: "row", lg: "column" }}
      justify="flex-start"
      align={{ base: "center", lg: "stretch" }}
      pb={{ base: 0, lg: 2 }}
      bg={colors.semanticColors.background.secondary}
      color={colors.semanticColors.foreground.primary}
      minH={{ base: "auto", lg: "full" }}
      minW="240px"
      borderRightWidth={{ base: 0, lg: 1 }}
      borderBottomWidth={{ base: 1, lg: 0 }}
      borderColor={colors.semanticColors.border.primary}
    >
      <HStack
        mx={0}
        px={NAV_HORIZONTAL_SPACING}
        flex={0}
        width="full"
        justifyContent="flex-start"
        minHeight={{ base: "auto", lg: NAV_LOGO_HEIGHT }}
        order={1}
      >
        <NavMenuCompact display={{ base: "block", lg: "none" }} />
        <HStack
          as={RouterLink}
          to="/"
          mx={0}
          flex={0}
          width="full"
          justifyContent="flex-start"
          minHeight={{ base: "auto", lg: NAV_LOGO_HEIGHT }}
          order={1}
        >
          <VStack
            position="relative"
            flex="0 0 24px"
            mr={{ base: 1, md: 2, lg: 0 }}
            ml={0}
          >
            <chakra.img
              src={colorMode === "light" ? blackLogo : whiteLogo}
              height={{ base: 6, md: 9 }}
              aria-label="Logo"
            ></chakra.img>
          </VStack>
          <Text fontWeight="700" fontSize="md" pt="3px">
            Materialize
          </Text>
        </HStack>
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
        <React.Suspense fallback={<Spinner />}>
          <EnvironmentSelectField />
        </React.Suspense>
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
        <HelpDropdown />
        <ProfileDropdown width="100%" display={{ base: "none", lg: "flex" }} />
      </Flex>
    </Flex>
  );
};

type NavItemType = {
  label: string;
  href: string;
  isInternal?: boolean;
};

const getNavItems = (regionSlug: string): NavItemType[] => [
  { label: "Connect", href: "/" },
  { label: "Clusters", href: `/${regionSlug}/clusters` },
  { label: "Sources", href: `/${regionSlug}/sources` },
  { label: "Sinks", href: `/${regionSlug}/sinks` },
  // { label: "Editor", href: "/editor" },
  {
    label: "Docs",
    href: "//materialize.com/docs/get-started/",
  },
];

const NavMenu = (props: BoxProps) => {
  const regionSlug = useRegionSlug();

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
      {getNavItems(regionSlug).map(({ label, href }) => (
        <NavItem key={label} label={label} href={href} />
      ))}
    </VStack>
  );
};

type NavMenuCompactProps = MenuButtonProps;

const NavMenuCompact = (props: NavMenuCompactProps) => {
  const regionSlug = useRegionSlug();

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
        {getNavItems(regionSlug).map((item) => (
          <MenuItem as={RouterLink} key={item.label} to={item.href}>
            {`${item.label}${item.isInternal ? " (internal)" : ""}`}
          </MenuItem>
        ))}
        <ProfileMenuItems />
      </MenuList>
    </Menu>
  );
};

const NavItem = (props: NavItemType) => {
  const { colors } = useTheme<MaterializeTheme>();
  const location = useLocation();
  const href = props.href || "#";
  const active =
    // top level nav items show active on nested routes
    // index must be exact match
    href.length > 1
      ? location.pathname.startsWith(href)
      : location.pathname === href;

  const linkContents = (
    <HStack
      aria-current={active ? "page" : undefined}
      spacing="2"
      width="full"
      px={NAV_HORIZONTAL_SPACING}
      py={2}
      transition="all 0.2s"
      color={colors.semanticColors.foreground.primary}
      _hover={NAV_HOVER_STYLES}
      _activeLink={{
        bg: colors.semanticColors.background.tertiary,
        color: colors.semanticColors.foreground.primary,
        paddingLeft: "4px",
        borderRightWidth: { base: "0px", lg: "2px" },
        borderRightColor: {
          base: "transparent",
          lg: colors.semanticColors.accent.purple,
        },
        px: 4,
      }}
    >
      <Box fontWeight="semibold">{props.label}</Box>
      {props.isInternal && (
        <Tag size="sm" colorScheme="purple">
          internal
        </Tag>
      )}
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
  const { colors } = useTheme<MaterializeTheme>();
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
              bg={colors.semanticColors.background.tertiary}
              rounded="full"
              h="8"
              w="8"
              color={colors.semanticColors.foreground.primary}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="md"
            >
              ?
            </Box>
          </Flex>
          <Text color={colors.semanticColors.foreground.primary}>Help</Text>
        </HStack>
      </MenuButton>
      <MenuList>
        <HelpDropdownLink href="https://materialize.com/docs/">
          Documentation
        </HelpDropdownLink>
        <HelpDropdownLink href="https://materialize.com/s/chat">
          Join us on Slack
        </HelpDropdownLink>
        <HelpDropdownLink href={SUPPORT_HREF}>Help Center</HelpDropdownLink>
      </MenuList>
    </Menu>
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
