import {
  Avatar,
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
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

import { getCurrentTenant, useAuth } from "../api/auth";
import TenantSwitcherModal from "../components/TenantSwitcherModal";
import { assert } from "../util";

const ProfileDropdown = () => {
  const history = useHistory();
  const { user, routes: authRoutes, tenantsState } = useAuth();
  const emailColor = useColorModeValue("gray.500", "gray.200");
  const signoutColor = useColorModeValue("red.500", "red.300");
  const [tenantSwitcherOpen, setTenantSwitcherOpen] = useState(false);
  const { switchTenant } = useAuthActions();

  const onTenantSelected = (newTenantId?: string) => {
    setTenantSwitcherOpen(false);
    if (newTenantId && newTenantId !== user.tenantId) {
      switchTenant({ tenantId: newTenantId });
    }
  };

  const tenantSwitchingEnabled = tenantsState.tenants.length > 1;

  assert(user); // This component is only rendered for logged-in users.

  return (
    <>
      <Menu>
        <MenuButton aria-label="Profile" title="Profile">
          <Avatar
            size="sm"
            src={user.profilePictureUrl || user.profileImage}
            name={user.name}
          />
        </MenuButton>
        {/* zIndex superior to Code Editor Run button */}
        <MenuList zIndex={2}>
          <VStack
            px="3"
            pt="3"
            pb="2"
            align="left"
            lineHeight="1.3"
            spacing="0"
          >
            <Text fontWeight="semibold">{user.name}</Text>
            <Text mt="1" fontSize="xs" color={emailColor}>
              {user.email}
            </Text>
          </VStack>
          <MenuDivider />
          <MenuGroup title="Organization">
            <MenuItem
              isDisabled={!tenantSwitchingEnabled}
              onClick={() => setTenantSwitcherOpen(true)}
              title={
                tenantSwitchingEnabled
                  ? "Change the active organization"
                  : undefined
              }
              justifyContent="space-between"
              gap="var(--ck-space-2)"
              _disabled={{ opacity: 1, cursor: "default" }}
            >
              {getCurrentTenant(user, tenantsState.tenants).name}
              {tenantSwitchingEnabled && <Tag>Change</Tag>}
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuItem fontWeight="medium" onClick={() => AdminPortal.show()}>
            Account settings
          </MenuItem>
          <MenuItem as={RouterLink} to="/access" fontWeight="medium">
            App passwords
          </MenuItem>
          <MenuItem
            fontWeight="medium"
            color={signoutColor}
            onClick={() => history.push(authRoutes.logoutUrl)}
          >
            Sign out
          </MenuItem>
        </MenuList>
      </Menu>
      <TenantSwitcherModal
        isOpen={tenantSwitcherOpen}
        onClose={onTenantSelected}
        user={user}
      />
    </>
  );
};

export default ProfileDropdown;
