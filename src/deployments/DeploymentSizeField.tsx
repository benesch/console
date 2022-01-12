import { Alert, AlertDescription } from "@chakra-ui/react";
import React from "react";

import { useAuth } from "../api/auth";
import { SelectField } from "../components/formComponents";
import SupportLink from "../components/SupportLink";

const DeploymentSizeField = () => {
  const { organization } = useAuth();
  const disabled = !!organization?.trialExpiresAt;
  return (
    <>
      <SelectField name="size" label="Size" size="sm">
        <option value="XS">Extra small</option>
        <option value="S">Small</option>
        <option value="M" disabled={disabled}>
          Medium
        </option>
        <option value="L" disabled={disabled}>
          Large
        </option>
        <option value="XL" disabled={disabled}>
          Extra large
        </option>
      </SelectField>
      <Alert status="info" variant="pale">
        <AlertDescription fontSize="sm">
          Need a larger size? <SupportLink>Contact us.</SupportLink>
        </AlertDescription>
      </Alert>
    </>
  );
};

export default DeploymentSizeField;
