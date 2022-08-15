import { CheckIcon } from "@chakra-ui/icons";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import type { User } from "@frontegg/redux-store";
import React from "react";

import { getCurrentTenant, useAuth } from "../api/auth";
import colors from "../theme/colors";

type Props = {
  user: User;
  isOpen: boolean;
  onClose: (selectedTenantId?: string) => void;
};

const TenantSwitcherModal = ({ isOpen, user, onClose }: Props) => {
  const { tenantsState } = useAuth();

  const closeModal = () => {
    onClose();
  };

  const onTenantSelected = (newTenantId: string) => {
    onClose(newTenantId);
  };

  const checkmarkHoverColor = useColorModeValue(
    colors.green[700],
    colors.green[200]
  );

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Switch Organization</ModalHeader>
        <ModalCloseButton />
        <ModalBody paddingBottom="var(--ck-space-4)">
          <VStack align="start">
            <Button
              variant="ghost"
              leftIcon={<CheckIcon color={colors.green[500]} />}
              disabled={true}
              pointerEvents="none"
              _disabled={{ opacity: "1" }}
            >
              {getCurrentTenant(user, tenantsState.tenants).name}
            </Button>
            {tenantsState.tenants
              .filter((tenant) => tenant.tenantId !== user.tenantId)
              .sort((left, right) => left.name.localeCompare(right.name))
              .map((tenant) => (
                <Button
                  role="group"
                  variant="ghost"
                  key={tenant.tenantId}
                  leftIcon={
                    <CheckIcon
                      opacity="0"
                      transition="opacity var(--ck-transition-duration-normal) var(--ck-transition-easing-ease-in-out)"
                      _groupHover={{ opacity: 1 }}
                      color={checkmarkHoverColor}
                      _hover={{ bg: "white" }}
                    />
                  }
                  onClick={() => onTenantSelected(tenant.tenantId)}
                  title={`Switch to ${tenant.name}`}
                >
                  {tenant.name}
                </Button>
              ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TenantSwitcherModal;
