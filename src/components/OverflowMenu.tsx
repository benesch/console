import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";

import OverflowMenuIcon from "~/svg/OverflowMenuIcon";

const OverflowMenu = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Menu gutter={2} placement="bottom-start">
        <MenuButton
          variant="none"
          as={Button}
          width="4"
          height="4"
          p="0"
          minWidth="auto"
        >
          <OverflowMenuIcon />
        </MenuButton>
        <MenuList>{children}</MenuList>
      </Menu>
    </>
  );
};

export default OverflowMenu;
