import { Tag } from "@chakra-ui/react";
import * as React from "react";

import { currentConsoleVersion } from "~/version/api";

const ConsoleVersionTag = () => {
  if (!currentConsoleVersion || currentConsoleVersion.length === 0) return null;
  return (
    <Tag
      size="sm"
      variant="outline"
      opacity={0.8}
      fontSize="80%"
      css={{ overflowWrap: "anywhere" }}
    >
      Release {currentConsoleVersion}
    </Tag>
  );
};

export default ConsoleVersionTag;
