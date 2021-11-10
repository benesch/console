import { Flex } from "@chakra-ui/react";
import React from "react";

import LoadingSvg from "./svg/loadingAnimation";

const LoadingScreen = () => {
  return (
    <Flex
      direction="column"
      height="100vh"
      width="100vw"
      align="center"
      justify="center"
    >
      <LoadingSvg />
    </Flex>
  );
};

export default LoadingScreen;
