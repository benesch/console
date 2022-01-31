import { useFormikContext } from "formik";
import * as React from "react";

import {
  DeploymentRequest,
  SupportedCloudRegion,
  useRegionsList,
} from "../../api/api";
import { SelectField } from "../../components/formComponents";

const filterProviders = (cloudProviders: SupportedCloudRegion[]) => {
  const currentProvider =
    useFormikContext<DeploymentRequest>().values.cloudProviderRegion.provider;

  return (
    cloudProviders?.filter(
      (provider) => provider.provider === currentProvider
    ) ?? []
  );
};

interface Props {
  loading: boolean;
  cloudProviders: SupportedCloudRegion[] | null;
}

const RegionSelectField = (props: Props) => {
  const providers = filterProviders(props.cloudProviders || []);
  return (
    <SelectField
      name="cloudProviderRegion.region"
      label="Region"
      size="sm"
      disabled={props.loading}
    >
      {providers.map((provider) => (
        <option key={provider.region} value={provider.region}>
          {provider.region}
        </option>
      ))}
    </SelectField>
  );
};

export default RegionSelectField;
