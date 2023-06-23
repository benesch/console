import { Alert, Text, useTheme } from "@chakra-ui/react";
import * as React from "react";

import { useCurrentOrganization } from "~/api/auth";
import SupportLink from "~/components/SupportLink";
import { MaterializeTheme } from "~/theme";

const AccountStatusAlert = () => {
  const { colors } = useTheme<MaterializeTheme>();
  const { organization } = useCurrentOrganization();
  if (!organization) {
    return null;
  }
  if (!organization.blocked) {
    return null;
  }
  return (
    <Alert
      backgroundColor={colors.background.warn}
      borderTopWidth="1px"
      borderTopColor={colors.border.warn}
      borderBottomWidth="1px"
      borderBottomColor={colors.border.warn}
      py={2}
      fontSize="sm"
      lineHeight="20px"
      color={colors.foreground.primary}
      status="warning"
      justifyContent="center"
      data-test-id="account-status-alert"
    >
      <Text>
        Your account has been blocked. Please reach out to{" "}
        <SupportLink>Materialize Support</SupportLink> for more information.
      </Text>
    </Alert>
  );
};

export default AccountStatusAlert;
