import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";

import { CopyableText } from "../../components/Copyable";
import { semanticColors } from "../../theme/colors";

interface Props {
  header: string;
  content: string;
}

const ConnectStepBoxDetail = (props: Props): JSX.Element => {
  const { content, header } = props;
  const headerTextColor = useColorModeValue("gray.700", "gray.100");
  const borderColor = useColorModeValue(
    semanticColors.divider.light,
    "gray.700"
  );
  return (
    <Box height="fit-content" flex="1 1 50px">
      <Text
        fontSize={{ base: "sm", md: "md", xl: "sm" }}
        color={headerTextColor}
        borderBottom="1px"
        borderColor={borderColor}
        width="fit-content"
      >
        {header}
      </Text>
      <Box pb={1} overflow="hidden">
        <CopyableText
          fontSize={{ base: "xs", md: "sm", xl: "xs" }}
          overflowWrap="break-word"
          overflow="hidden"
          width="100%"
        >
          {content}
        </CopyableText>
      </Box>
    </Box>
  );
};

export default ConnectStepBoxDetail;
