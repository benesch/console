import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";

import { DeletableObjectType } from "~/api/materialize/buildDeletObjectStatement";
import { DatabaseObject } from "~/api/materialize/types";
import OverflowMenuIcon from "~/svg/OverflowMenuIcon";

import DeleteObjectModal from "./DeleteObjectModal";

export interface OverflowMenuProps {
  selectedObject: DatabaseObject;
  refetchObjects: () => void;
  objectType: DeletableObjectType;
}

const OverflowMenu = ({
  selectedObject,
  refetchObjects,
  objectType,
  children,
}: PropsWithChildren<OverflowMenuProps>) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Menu>
        <MenuButton variant="none" as={Button}>
          <OverflowMenuIcon />
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => onOpen()}>Delete</MenuItem>
          {children}
        </MenuList>
      </Menu>
      {isOpen && (
        <DeleteObjectModal
          isOpen
          onClose={() => {
            onClose();
          }}
          onSuccess={refetchObjects}
          dbObject={selectedObject}
          objectType={objectType}
        />
      )}
    </>
  );
};

export default OverflowMenu;
