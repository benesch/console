import { MenuItem, useDisclosure } from "@chakra-ui/react";
import React from "react";

import { DeletableObjectType } from "~/api/materialize/buildDeletObjectStatement";
import { DatabaseObject } from "~/api/materialize/types";

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
  return (
    <>
      <MenuItem onClick={() => onOpen()}>Delete</MenuItem>
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
