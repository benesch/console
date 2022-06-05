import { Box, Text } from "@chakra-ui/react";
import React from "react";

import { CopyableText } from "../../components/Copyable";

interface Props {
  header: string;
  content: string;
}

const ConnectStepBoxDetail = (props: Props): JSX.Element => {
  const { content, header } = props;
  return (
    <Box textColor="gray.600" height="fit-content">
      <Text
        fontSize="sm"
        borderBottom="1px"
        borderColor="gray.700"
        width="fit-content"
      >
        {header}
      </Text>
      <Box padding={1} overflow="hidden">
        <CopyableText
          fontSize="xs"
          overflowWrap="break-word"
          overflow="hidden"
          textColor="gray.400"
          width="100%"
        >
          {content}
        </CopyableText>
      </Box>
    </Box>
  );
};

export default ConnectStepBoxDetail;
