/**
 * @module
 * Environment destruction modal.
 */

import { DeleteIcon } from "@chakra-ui/icons";
import { Button, ButtonProps, Spinner, Text, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { useRecoilState } from "recoil";

import { SupportedCloudRegion } from "../../api/backend";
import { useEnvironmentsDestroy } from "../../api/environment-controller";
import { useEnvironments } from "../../api/environment-controller-fetch";
import DangerActionModal from "../../components/DangerActionModal";
import { currentEnvironment } from "../../recoil/environments";

interface Props extends ButtonProps {
  region: SupportedCloudRegion;
  canWrite: boolean;
}

const DestroyEnvironmentModal = (props: Props) => {
  const { region, canWrite, ...buttonProps } = props;
  const { mutate: destroyEnvironment } = useEnvironmentsDestroy({
    base: region.environmentControllerUrl,
  });
  const { refetch } = useEnvironments();
  const toast = useToast();
  const [didDelete, setDidDelete] = useState(false);
  const [current, setCurrent] = useRecoilState(currentEnvironment);

  const handleDelete = async () => {
    await destroyEnvironment();

    /**
     * Regions are unique. If the current environment is selected it should be removed as the current.
     * Async refetch. Otherwise blocks UI.
     */
    const { region: regionName } = region;
    if (current && current.region === regionName) {
      /**
       * Refetch environments to get a new current.
       * First needs the refetch needs to happen and then remove the current.
       */
      const asyncRefetch = async () => {
        await refetch();
        setCurrent(null);
      };

      asyncRefetch();
    }

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

  if (!canWrite) {
    return (
      <Button
        disabled
        leftIcon={<DeleteIcon />}
        size="sm"
        colorScheme="red"
        {...buttonProps}
        title="Only admins can tear down regions."
      >
        Destroy
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
