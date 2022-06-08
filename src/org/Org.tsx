import { Tag } from "@chakra-ui/react";
import * as React from "react";

import { useAuth } from "../api/auth";

const Org = () => {
  const { user } = useAuth();
  if (
    user?.tenantId == null ||
    user.email == null ||
    !user.email.endsWith("@materialize.com")
  )
    return null;
  return (
    <Tag size="sm" variant="outline" opacity={0.8} fontSize="80%">
      Org ID {user.tenantId}
    </Tag>
  );
};

export default Org;
