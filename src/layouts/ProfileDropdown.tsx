import {
  Avatar,
  ButtonProps,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Tag,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { AdminPortal, useAuthActions } from "@frontegg/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

import { getCurrentTenant, useAuth } from "../api/auth";
import { assert } from "../util";
import { NAV_HORIZONTAL_SPACING, NAV_HOVER_STYLES } from "./NavBar";

export const AVATAR_WIDTH = 8;

const ProfileDropdown = (props: ButtonProps) => {
  const { user, tenantsState } = useAuth();
  const emailColor = useColorModeValue("gray.500", "gray.200");
  const { switchTenant } = useAuthActions();

  const tenantSwitchingEnabled = tenantsState.tenants.length > 1;
  const currentTenant = getCurrentTenant(user, tenantsState.tenants);

  const handleTenantClick = (tenantId: string) => {
    if (tenantSwitchingEnabled && tenantId !== currentTenant?.tenantId) {
      switchTenant({ tenantId });
    }
  };

  assert(user); // This component is only rendered for logged-in users.

  return (
    <Menu>
      <MenuButton
        aria-label="Profile"
        title="Profile"
        px={NAV_HORIZONTAL_SPACING}
        py={2}
        {...props}
        _hover={NAV_HOVER_STYLES}
      >
        <HStack>
          <Avatar
            h={AVATAR_WIDTH}
            w={AVATAR_WIDTH}
            src={user.profilePictureUrl || user.profileImage}
            name={user.name}
          />
          <Text>Account</Text>
        </HStack>
      </MenuButton>
      {/* zIndex superior to Code Editor Run button */}
      <MenuList zIndex={2}>
        <VStack px="3" pt="3" pb="2" align="left" lineHeight="1.3" spacing="0">
          <Text fontWeight="semibold">{user.name}</Text>
          <Text mt="1" fontSize="xs" color={emailColor}>
            {user.email}
          </Text>
        </VStack>
        <MenuDivider />
        <MenuGroup title="Organization">
          {tenantsState.tenants
            .filter((tenant) => tenant && tenant.name)
            .sort((t1, t2) =>
              // always show orgs in the same order
              t1.name.toLowerCase() < t2.name.toLowerCase() ? -1 : 1
            )
            .map((tenant) => (
              <MenuItem
                key={`org-${tenant.tenantId}`}
                isDisabled={!tenantSwitchingEnabled}
                title={
                  tenantSwitchingEnabled &&
                  currentTenant?.tenantId !== tenant.tenantId
                    ? "Set as active organization"
                    : "Current organization"
                }
                justifyContent="space-between"
                gap="var(--ck-space-2)"
                _disabled={{
                  opacity: 1,
                  cursor: "default",
                  background: "none",
                }}
                _active={{
                  // clicking flashes a background when disabled without this
                  background: "none",
                }}
                _hover={{
                  background:
                    currentTenant?.tenantId === tenant.tenantId
                      ? "none"
                      : "default",
                  cursor:
                    currentTenant?.tenantId === tenant.tenantId
                      ? "default"
                      : "pointer",
                }}
                disabled={currentTenant?.tenantId === tenant.tenantId}
                onClick={() => handleTenantClick(tenant.tenantId)}
              >
                {tenant.name}{" "}
                {currentTenant?.tenantId === tenant.tenantId && (
                  <Tag size="sm" colorScheme="lavender">
                    active
                  </Tag>
                )}
              </MenuItem>
            ))}
        </MenuGroup>
        <MenuDivider />
        <ProfileMenuItems />
      </MenuList>
    </Menu>
  );
};

export const ProfileMenuItems = () => {
  const navigate = useNavigate();
  const { routes: authRoutes } = useAuth();
  const signoutColor = useColorModeValue("red.500", "red.300");
  return (
    <>
      <MenuItem as={RouterLink} to="/access" fontWeight="medium">
        App passwords
      </MenuItem>
      <MenuItem fontWeight="medium" onClick={() => AdminPortal.show()}>
        Account settings
      </MenuItem>
      <MenuItem as={RouterLink} to="/pricing" fontWeight="medium">
        Pricing
      </MenuItem>
      <MenuItem
        fontWeight="medium"
        color={signoutColor}
        onClick={() => navigate(authRoutes.logoutUrl)}
      >
        Sign out
      </MenuItem>
    </>
  );
};

export default ProfileDropdown;
