import { ArrowUpIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import {
  Button,
  Code,
  ListItem,
  OrderedList,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { useAuth } from "../../api/auth";
import CodeBlock from "../../components/CodeBlock";
import TextLink from "../../components/TextLink";
import { currentEnvironment } from "../../recoil/currentEnvironment";

const ConnectButton = () => {
  const { user } = useAuth();
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
            <OrderedList spacing="6">
              <ListItem>
                In your terminal, enter:
                <CodeBlock
                  contents={`psql "postgres://${encodeURIComponent(
                    user.email
                  )}@${current?.coordd_address}/materialize"`}
                />
              </ListItem>
              <ListItem>
                Paste in your app-specific password when prompted. If you
                don&apos;t have one yet you can{" "}
                <TextLink href="/access">generate one here</TextLink>!
              </ListItem>
              <ListItem>
                Try out <Code>SHOW CLUSTERS;</Code> and{" "}
                <TextLink href="https://materialize.com/docs/get-started/">
                  get started
                </TextLink>
                !
              </ListItem>
            </OrderedList>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConnectButton;
