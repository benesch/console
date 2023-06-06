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
import { useFlags } from "launchdarkly-react-client-sdk";
import * as React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import segment from "~/analytics/segment";
import FreeTrialNotice from "~/components/FreeTrialNotice";
import { SUPPORT_HREF } from "~/components/SupportLink";
import SwitchStackModal from "~/components/SwitchStackModal";
import blackLogo from "~/img/logo-black.svg";
import whiteLogo from "~/img/logo-white.svg";
import EnvironmentSelectField from "~/layouts/EnvironmentSelect";
import ProfileDropdown, {
  AVATAR_WIDTH,
  ProfileMenuItems,
} from "~/layouts/ProfileDropdown";
import {
  currentEnvironmentState,
  LoadedEnvironment,
} from "~/recoil/environments";
import { useRegionSlug } from "~/region";
import { ClustersIcon } from "~/svg/nav/ClustersIcon";
import { ConnectIcon } from "~/svg/nav/ConnectIcon";
import { ConnectionsIcon } from "~/svg/nav/ConnectionsIcon";
import { SecretsIcon } from "~/svg/nav/SecretsIcon";
import { SinksIcon } from "~/svg/nav/SinksIcon";
import { SourcesIcon } from "~/svg/nav/SourcesIcon";
import { MaterializeTheme } from "~/theme";

export const NAV_HORIZONTAL_SPACING = 4;
export const NAV_HOVER_STYLES = {
  bg: "semanticColors.background.tertiary",
};
export const NAV_LOGO_HEIGHT = "80px";

function isEnvironmentHealthy(environment?: LoadedEnvironment) {
  return (
    environment?.state === "enabled" && environment.status.health === "healthy"
  );
}

export const HideIfEnvironmentUnhealthy = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );

  if (!isEnvironmentHealthy(currentEnvironment)) {
    return null;
  }

  return <>{children}</>;
};

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
        alignItems="flex-start"
        justifyContent="stretch"
        px={NAV_HORIZONTAL_SPACING}
        order={{ base: 100, lg: 2 }}
      >
        <React.Suspense
          fallback={
            <Box minH={{ base: "auto", lg: "54px" }}>
              <Spinner />
            </Box>
          }
        >
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
        <FreeTrialNotice my="6" mx="4" />
        <SwitchStackModal />
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
  onClick?: () => void;
  icon: JSX.Element;
};

type NavItemsGroupType = {
  id: string;
  title: string;
  navItems: NavItemType[];
  hideIfEnvironmentUnhealthy?: boolean;
};

const getNavItems = (
  regionSlug: string,
  flags: ReturnType<typeof useFlags>
): NavItemsGroupType[] => {
  return [
    {
      id: "connect",
      title: "", // No title since this is temporary and doesn't fit cleanly into the taxonomy
      hideIfEnvironmentUnhealthy: false,
      navItems: [
        {
          label: "Connect",
          href: `/regions/${regionSlug}/connect`,
          icon: <ConnectIcon />,
        },
      ],
    },
    {
      id: "compute",
      title: "Compute",
      hideIfEnvironmentUnhealthy: true,
      navItems: [
        {
          label: "Clusters",
          href: `/regions/${regionSlug}/clusters`,
          icon: <ClustersIcon />,
        },
      ],
    },
    {
      id: "data",
      title: "Data",
      hideIfEnvironmentUnhealthy: true,
      navItems: [
        {
          label: "Sources",
          href: `/regions/${regionSlug}/sources`,
          icon: <SourcesIcon />,
        },
        {
          label: "Sinks",
          href: `/regions/${regionSlug}/sinks`,
          icon: <SinksIcon />,
        },
      ],
    },
    ...(flags["source-creation-41"]
      ? [
          {
            id: "configuration",
            title: "Configuration",
            hideIfEnvironmentUnhealthy: true,
            navItems: [
              {
                label: "Connections",
                href: `/regions/${regionSlug}/connections`,
                icon: <ConnectionsIcon />,
              },
              {
                label: "Secrets",
                href: `/regions/${regionSlug}/secrets`,
                icon: <SecretsIcon />,
              },
            ],
          },
        ]
      : []),
    // { label: "Editor", href: "/editor" },
  ];
};

const NavItemsGroup = (props: NavItemsGroupType) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <VStack width="100%" alignItems="start" spacing={1}>
      {props.title && (
        <Text
          px={2}
          py={props.hideIfEnvironmentUnhealthy ? 0 : 2}
          width="100%"
          textStyle="text-small"
          fontWeight="600"
          textTransform="uppercase"
          color={semanticColors.foreground.secondary}
        >
          {props.title}
        </Text>
      )}
      {props.navItems.map(({ label, href, onClick, icon }: NavItemType) => (
        <NavItem
          label={label}
          href={href}
          onClick={onClick}
          key={label}
          icon={icon}
        />
      ))}
    </VStack>
  );
};

const NavMenu = (props: BoxProps) => {
  const flags = useFlags();
  const regionSlug = useRegionSlug();

  const navGroups = getNavItems(regionSlug, flags);

  return (
    <VStack
      data-test-id="nav-lg"
      mx={4}
      spacing={2}
      flex="2"
      alignSelf="stretch"
      alignItems="stretch"
      mt={0}
      mb={{ base: 0.5, xl: 1 }}
      {...props}
    >
      {navGroups.map((group) => {
        return group.hideIfEnvironmentUnhealthy ? (
          <HideIfEnvironmentUnhealthy key={group.id}>
            <NavItemsGroup key={group.id} {...group} />
          </HideIfEnvironmentUnhealthy>
        ) : (
          <NavItemsGroup key={group.id} {...group} />
        );
      })}
    </VStack>
  );
};

type NavMenuCompactProps = MenuButtonProps;

const NavMenuCompact = (props: NavMenuCompactProps) => {
  const flags = useFlags();
  const regionSlug = useRegionSlug();

  const navGroups = getNavItems(regionSlug, flags);

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
        <VStack w="100%">
          {navGroups.map((group) => {
            return group.hideIfEnvironmentUnhealthy ? (
              <HideIfEnvironmentUnhealthy key={group.id}>
                <NavItemsGroup key={group.id} {...group} />
              </HideIfEnvironmentUnhealthy>
            ) : (
              <NavItemsGroup key={group.id} {...group} />
            );
          })}
          <ProfileMenuItems />
        </VStack>
      </MenuList>
    </Menu>
  );
};

export function isSubroute(route: string, potentialSubroute: string) {
  const routeSegments = route.split("/").filter(Boolean);
  const potentialSubrouteSegments = potentialSubroute
    .split("/")
    .filter(Boolean);

  return routeSegments.every(
    (routeSegment, index) => routeSegment === potentialSubrouteSegments[index]
  );
}

const NavItem = (props: NavItemType) => {
  const { colors } = useTheme<MaterializeTheme>();
  const location = useLocation();
  const href = props.href || "#";
  const active = isSubroute(href, location.pathname);

  const linkContents = (
    <HStack
      width="100%"
      aria-current={active ? "page" : undefined}
      spacing="2"
      px={2}
      py={2}
      transition="all 0.2s"
      borderRadius={{ lg: "lg", md: "none" }}
      color={colors.semanticColors.foreground.primary}
      _hover={NAV_HOVER_STYLES}
      _activeLink={{
        bg: colors.semanticColors.background.tertiary,
        color: colors.semanticColors.foreground.primary,
      }}
    >
      {props.icon}
      <Box textStyle="text-ui-med">{props.label}</Box>
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
      <HStack as={RouterLink} to={href} onClick={props.onClick} width="100%">
        {linkContents}
      </HStack>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={props.onClick}>
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
        <HelpDropdownLink
          href="https://materialize.com/docs/"
          onClick={() => {
            segment.track("Link Click", {
              label: "Docs",
              href: "https://materialize.com/docs/",
            });
          }}
        >
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
  onClick?: () => void;
}

const HelpDropdownLink = (props: HelpDropdownLinkProps) => {
  return (
    <MenuItem as="a" target="_blank" fontWeight="medium" {...props}>
      {props.children}
    </MenuItem>
  );
};

export default NavBar;
