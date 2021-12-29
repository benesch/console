import { Flex, useTheme } from "@chakra-ui/react";
import * as React from "react";

import LoadingSvg from "../svg/LoadingSvg";
import { marketingBg } from "./authSignup/styles";

const EmbeddedLoading = () => {
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

export default EmbeddedLoading;
