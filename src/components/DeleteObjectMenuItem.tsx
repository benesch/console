import { MenuItem, useDisclosure, useTheme } from "@chakra-ui/react";
import React from "react";

import { DeletableObjectType } from "~/api/materialize/buildDeletObjectStatement";
import { DatabaseObject } from "~/api/materialize/types";
import { MaterializeTheme } from "~/theme";

import DeleteObjectModal from "./DeleteObjectModal";

export interface DeleteObjectMenuItemProps {
  selectedObject: DatabaseObject;
  refetchObjects: () => void;
  objectType: DeletableObjectType;
}

const DeleteObjectMenuItem = ({
  selectedObject,
  refetchObjects,
  objectType,
}: DeleteObjectMenuItemProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  return (
    <>
      <MenuItem
        onClick={() => onOpen()}
        textStyle="text-ui-med"
        color={semanticColors.accent.red}
      >
        Drop {objectType.toLowerCase()}
      </MenuItem>
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

export default DeleteObjectMenuItem;
