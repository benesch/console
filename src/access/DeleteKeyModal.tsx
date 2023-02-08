/**
 * @module
 * Deployment destruction modal.
 */

import { DeleteIcon } from "@chakra-ui/icons";
import { ButtonProps, Text, useTheme } from "@chakra-ui/react";
import { useApiTokensActions } from "@frontegg/react";
import React from "react";

import DangerActionModal from "~/components/DangerActionModal";
import { MaterializeTheme } from "~/theme";

interface Props extends ButtonProps {
  clientId: string;
  description: string;
  deleteCb: (id: string) => void;
}

const DeleteKeyModal = (props: Props) => {
  const { deleteUserApiToken } = useApiTokensActions();

  const handleDelete = async () => {
    props.deleteCb(props.clientId);
    deleteUserApiToken(props.clientId);
  };

  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

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
      <Text fontSize="sm" color={semanticColors.foreground.primary}>
        Deleting this app password will revoke access to any devices or services
        using it to connect to Materialize.
      </Text>
    </DangerActionModal>
  );
};

export default DeleteKeyModal;
