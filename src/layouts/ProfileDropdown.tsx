import {
  Avatar,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { AdminPortal } from "@frontegg/react";
import React from "react";
import { useHistory } from "react-router-dom";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useAuth } from "../api/auth";
import { assert } from "../util";

const ProfileDropdown = () => {
  const history = useHistory();
  const { user, routes: authRoutes } = useAuth();
  const emailColor = useColorModeValue("gray.500", "gray.200");
  const signoutColor = useColorModeValue("red.500", "red.300");

  assert(user); // This component is only rendered for logged-in users.

  return (
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
        <VStack px="3" pt="3" pb="2" align="left" lineHeight="1.3" spacing="0">
          <Text fontWeight="semibold">{user.name}</Text>
          <Text mt="1" fontSize="xs" color={emailColor}>
            {user.email}
          </Text>
        </VStack>
        <MenuDivider />
        <MenuItem fontWeight="medium" onClick={() => AdminPortal.show()}>
          Account settings
        </MenuItem>
        <MenuItem as={RouterLink} to="/access" fontWeight="medium">
          App-specific passwords
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
  );
};

export default ProfileDropdown;
