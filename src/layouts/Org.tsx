import { Tag } from "@chakra-ui/react";
import * as React from "react";

import { useAuth } from "~/api/auth";
import { CopyButton } from "~/components/copyableComponents";
import { isMzInternalEmail } from "~/util";

const Org = () => {
  const { user } = useAuth();
  if (!isMzInternalEmail(user.email)) return null;
  return (
    <Tag
      size="sm"
      variant="outline"
      opacity={0.8}
      fontSize="80%"
      css={{ overflowWrap: "anywhere" }}
    >
      Org ID {user.tenantId}
      <CopyButton contents={user.tenantId} px={1} ml={1} title="Copy org ID" />
    </Tag>
  );
};

export default Org;
