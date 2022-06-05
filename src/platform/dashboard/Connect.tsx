import { ArrowUpIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { Button, Spinner, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { currentEnvironment } from "../../recoil/currentEnvironment";
import ConnectSteps from "./ConnectSteps";

const ConnectButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialFocusRef = React.useRef(null);
  const [current, _] = useRecoilState(currentEnvironment);
  return (
    <>
      <Button
        size="lg"
        variant="gradient-1"
        leftIcon={current ? <ArrowUpIcon /> : <Spinner />}
        onClick={onOpen}
        disabled={!current}
      >
        Connect now
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={initialFocusRef}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Connect to {current?.provider}/{current?.region}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt="4" pb="8" px="6">
            <ConnectSteps />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConnectButton;
