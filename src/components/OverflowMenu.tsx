import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";

import OverflowMenuIcon from "~/svg/OverflowMenuIcon";

const OverflowMenu = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Menu>
        <MenuButton variant="none" as={Button}>
          <OverflowMenuIcon />
        </MenuButton>
        <MenuList>{children}</MenuList>
      </Menu>
    </>
  );
};

export default OverflowMenu;
