/**
 * @module
 * Deployment destruction modal.
 */

import { DeleteIcon } from "@chakra-ui/icons";
import { ButtonProps, Text } from "@chakra-ui/react";
import { useApiTokensActions } from "@frontegg/react";
import React from "react";

import DangerActionModal from "../components/DangerActionModal";

interface Props extends ButtonProps {
  clientId: string;
  description: string;
  tenantName?: string;
  deleteCb: (id: string) => void;
}

const DeleteKeyModal = (props: Props) => {
  const { deleteUserApiToken, deleteTenantApiToken } = useApiTokensActions();

  const handleDelete = async () => {
    props.deleteCb(props.clientId);
    props.tenantName
      ? deleteTenantApiToken(props.clientId)
      : deleteUserApiToken(props.clientId);
  };

  return (
    <DangerActionModal
      title="Delete password"
      aria-label="Delete password"
      colorScheme="red"
      confirmIcon={<DeleteIcon />}
      actionText=""
      finalActionText="Delete"
      disabled={props.disabled}
      confirmText={props.description}
      onConfirm={handleDelete}
      size="sm"
      variant="outline"
    >
      <Text fontSize="sm">
        <strong>Are you sure?</strong> Deleting this app password is
        irreversible.
      </Text>
    </DangerActionModal>
  );
};

export default DeleteKeyModal;
