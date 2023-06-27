import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  Portal,
  useTheme,
} from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";

import OverflowMenuIcon from "~/svg/OverflowMenuIcon";
import { MaterializeTheme } from "~/theme";

export const OVERFLOW_BUTTON_WIDTH = 8;

const OverflowMenu = ({ children }: PropsWithChildren) => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <>
      <Menu gutter={2} placement="bottom-start">
        <MenuButton
          variant="none"
          as={Button}
          width={OVERFLOW_BUTTON_WIDTH}
          height={OVERFLOW_BUTTON_WIDTH}
          p="0"
          minWidth="auto"
          onClick={(e) => e.stopPropagation()}
          _hover={{
            background: colors.background.tertiary,
          }}
        >
          <OverflowMenuIcon />
        </MenuButton>
        {/* The portal prevents hover state from bubbling up to the parent table row */}
        <Portal>
          <MenuList>{children}</MenuList>
        </Portal>
      </Menu>
    </>
  );
};

export default OverflowMenu;
