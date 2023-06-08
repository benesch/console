import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/modal";
import { HStack, Spinner, Text, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

const ProlongedPostgresSourceCreationModal = (props: { isOpen: boolean }) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <Modal
      isOpen={props.isOpen}
      onClose={() => null}
      isCentered
      variant="shrink-to-fit"
    >
      <ModalOverlay />
      <ModalContent>
        <HStack p="10" spacing="4">
          <Spinner
            size="sm"
            thickness="1.33px"
            color={semanticColors.accent.brightPurple}
          />
          <Text
            textStyle="text-ui-med"
            color={semanticColors.foreground.primary}
          >
            Attempting to connect to postgres...
          </Text>
        </HStack>
      </ModalContent>
    </Modal>
  );
};

export default ProlongedPostgresSourceCreationModal;
