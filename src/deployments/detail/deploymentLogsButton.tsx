import {
  Button,
  ButtonProps,
  Checkbox,
  HStack,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import download from "downloadjs";
import React from "react";

import { Deployment, useDeploymentsLogsRetrieve } from "../../api/api";
import { useAuth } from "../../api/auth";
import { CodeBlock } from "../../components/codeblock";

interface DeploymentLogsButtonProps extends ButtonProps {
  deployment: Deployment;
}

export function DeploymentLogsButton({
  deployment,
  ...props
}: DeploymentLogsButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { fetchAuthed } = useAuth();
  const { loading, data, refetch } = useDeploymentsLogsRetrieve({
    id: deployment.id,
  });
  const [wrap, setWrap] = React.useState(false);

  const handleOpen = () => {
    refetch();
    onOpen();
  };

  const downloadLogs = async () => {
    const response = await fetchAuthed(
      `/api/deployments/${deployment.id}/logs`
    );
    const blob = await response.blob();
    download(blob, `${deployment.name}.log`, "text/plain");
  };

  let logs;
  if (data) {
    logs = (
      <CodeBlock
        contents={data}
        wrap={wrap}
        lineNumbers={true}
        fontSize="sm"
        my="0"
      />
    );
  } else {
    logs = <Text p="5">No logs yet.</Text>;
  }

  return (
    <>
      <Button onClick={handleOpen} {...props}>
        View logs
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Logs</ModalHeader>
          <ModalCloseButton />
          {logs}
          <ModalFooter>
            <HStack flex="1">
              <Checkbox
                onChange={(e) => setWrap(e.target.checked)}
                isChecked={wrap}
              >
                Wrap lines
              </Checkbox>
              <Spacer />
              <Button isLoading={loading} onClick={() => refetch()} size="sm">
                Refresh
              </Button>
              <Button
                onClick={downloadLogs}
                disabled={!data}
                colorScheme="purple"
                size="sm"
              >
                Download
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
