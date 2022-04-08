import { useFormikContext } from "formik";
import * as React from "react";

import {
  DeploymentRequest,
  SupportedCloudRegion,
  useCloudProvidersList,
} from "../../api/backend";
import { SelectField } from "../../components/formComponents";

interface Props {
  loading: boolean;
  cloudProviders: SupportedCloudRegion[] | null;
}

const CloudProviderSelectField = (props: Props) => {
  const providers = [
    ...new Set((props.cloudProviders || []).map((cp) => cp.provider)),
  ];
  return (
    <SelectField
      name="cloudProviderRegion.provider"
      label="Cloud provider"
      size="sm"
      disabled={props.loading || providers.length === 1}
    >
      {providers.map((provider) => (
        <option key={provider} value={provider}>
          {provider}
        </option>
      ))}
    </SelectField>
  );
};

export default CloudProviderSelectField;
