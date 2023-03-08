import { Alert, Text, useTheme } from "@chakra-ui/react";
import * as React from "react";

import { getCurrentTenant, getTenantMetadata, useAuth } from "~/api/auth";
import SupportLink from "~/components/SupportLink";
import { MaterializeTheme } from "~/theme";

const AccountStatusAlert = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const { user, tenantsState } = useAuth();
  const currentTenant = getCurrentTenant(user, tenantsState.tenants);
  if (!currentTenant) {
    return null;
  }
  const tenantMetadata = getTenantMetadata(currentTenant);
  if (!tenantMetadata.blocked) {
    return null;
  }
  return (
    <Alert
      backgroundColor={semanticColors.background.warn}
      borderTopWidth="1px"
      borderTopColor={semanticColors.border.warn}
      borderBottomWidth="1px"
      borderBottomColor={semanticColors.border.warn}
      py={2}
      fontSize="sm"
      lineHeight="20px"
      color={semanticColors.foreground.primary}
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
