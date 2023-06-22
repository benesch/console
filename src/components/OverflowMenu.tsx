import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";

import OverflowMenuIcon from "~/svg/OverflowMenuIcon";

import DeleteObjectModal from "./DeleteObjectModal";

export interface OverflowMenuProps {
  selectedObject: DatabaseObject;
  refetchObjects: () => void;
  objectType:
    | "SECRET"
    | "CONNECTION"
    | "SOURCE"
    | "SINK"
    | "CLUSTER"
    | "CLUSTER REPLICA";
}

export interface DatabaseObject {
  id: string;
  name: string;
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
          objectId={selectedObject.id}
          objectName={selectedObject.name}
          objectType={objectType}
        />
      )}
    </>
  );
};

export default OverflowMenu;
