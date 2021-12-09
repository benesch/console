import { useFormikContext } from "formik";
import * as React from "react";

import {
  DeploymentRequest,
  ProviderEnum,
  SupportedCloudRegion,
  useRegionsList,
} from "../../api/api";
import { SelectField } from "../../components/form";

export const useRegions = () => {
  const currentProvider =
    useFormikContext<DeploymentRequest>().values.cloudProviderRegion.provider;
  const getRegionsOperation = useRegionsList({
    providerName: currentProvider,
  });

  return {
    operation: getRegionsOperation,
    regions:
      getRegionsOperation.data?.filter(
        (region) => region.provider === currentProvider
      ) ?? [],
  };
};

export const RegionSelectField = () => {
  const { operation, regions } = useRegions();
  return (
    <SelectField
      name="cloudProviderRegion.region"
      label="Region"
      size="sm"
      disabled={operation.loading}
    >
      {regions.map((supportedRegion) => (
        <option key={supportedRegion.region} value={supportedRegion.region}>
          {supportedRegion.region}
        </option>
      ))}
    </SelectField>
  );
};
