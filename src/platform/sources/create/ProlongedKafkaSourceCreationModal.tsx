import {
  HStack,
  Modal,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
  useTheme,
} from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

const ProlongedKafkaSourceCreationModal = (props: { isOpen: boolean }) => {
  const { colors } = useTheme<MaterializeTheme>();
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
            color={colors.accent.brightPurple}
          />
          <Text textStyle="text-ui-med" color={colors.foreground.primary}>
            Attempting to connect to kafka...
          </Text>
        </HStack>
      </ModalContent>
    </Modal>
  );
};

export default ProlongedKafkaSourceCreationModal;
