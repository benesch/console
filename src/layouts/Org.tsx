import { Tag } from "@chakra-ui/react";
import * as React from "react";

import { useAuth } from "../api/auth";
import { CopyButton } from "../components/copyableComponents";

const Org = () => {
  const { user } = useAuth();
  if (!user.email.endsWith("@materialize.com")) return null;
  return (
    <Tag size="sm" variant="outline" opacity={0.8} fontSize="80%">
      Org ID {user.tenantId}
      <CopyButton contents={user.tenantId} px={1} ml={1} title="Copy org ID" />
    </Tag>
  );
};

export default Org;
