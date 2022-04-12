/**
 * @module
 * Environment destruction modal.
 */

import { DeleteIcon } from "@chakra-ui/icons";
import { Button, ButtonProps, Spinner, Text, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { useHistory } from "react-router";

import { SupportedCloudRegion } from "../../api/backend";
import { useEnvironmentsDestroy } from "../../api/environment-controller";
import DangerActionModal from "../../components/DangerActionModal";

interface Props extends ButtonProps {
  region: SupportedCloudRegion;
}

const DestroyEnvironmentModal = (props: Props) => {
  const { region, ...buttonProps } = props;
  const { mutate: destroyEnvironment } = useEnvironmentsDestroy({
    base: region.environmentControllerUrl,
  });
  const toast = useToast();
  const [didDelete, setDidDelete] = useState(false);

  const handleDelete = async () => {
    await destroyEnvironment();
    setDidDelete(true);
    toast({
      title: "Region queued for deletion.",
      status: "error",
    });
  };

  if (didDelete) {
    return (
      <Button
        disabled
        leftIcon={<Spinner size="sm" />}
        size="sm"
        colorScheme="red"
        {...buttonProps}
      >
        Destroying
      </Button>
    );
  }

  return (
    <DangerActionModal
      title="Destroy region"
      colorScheme="red"
      confirmIcon={<DeleteIcon />}
      actionText="Destroy"
      confirmText={`${props.region.provider}/${props.region.region}`}
      onConfirm={handleDelete}
      size="sm"
      {...buttonProps}
    >
      <Text fontSize="sm">
        <strong>Are you sure?</strong> Destroying this region is irreversible.
      </Text>
    </DangerActionModal>
  );
};

export default DestroyEnvironmentModal;
