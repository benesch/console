import { Tag } from "@chakra-ui/react";
import * as React from "react";

import { currentVersion } from "~/version/api";

const Version = () => {
  if (!currentVersion || currentVersion.length === 0) return null;
  return (
    <Tag
      size="sm"
      variant="outline"
      opacity={0.8}
      fontSize="80%"
      css={{ overflowWrap: "anywhere" }}
    >
      Release {currentVersion}
    </Tag>
  );
};

export default Version;
