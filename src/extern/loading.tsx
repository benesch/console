import { Flex, useTheme } from "@chakra-ui/react";
import * as React from "react";

import LoadingSvg from "../svg/loadingAnimation";
import { marketingBg } from "./styles";

export const EmbeddedLoading = () => {
  const { colors } = useTheme();
  return (
    <Flex
      direction="column"
      height="100vh"
      width="100vw"
      align="center"
      justify="center"
      bg={marketingBg}
    >
      <LoadingSvg fillColor={colors.purple[700]} width={64} />
    </Flex>
  );
};
