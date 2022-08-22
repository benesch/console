import { Box, VStack } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import useEnvironmentState from "../../api/useEnvironmentState";
import { Card, CardContent, CardHeader } from "../../components/cardComponents";
import { PageBreadcrumbs } from "../../layouts/BaseLayout";
import EnvironmentSelectField from "../../layouts/EnvironmentSelect";
import { currentEnvironment } from "../../recoil/environments";
import ConnectSteps from "./ConnectSteps";
import GetStartedDocs from "./GetStartedDocs";
import PasswordStep from "./PasswordStep";
import StarterEnvironmentModal from "./StarterEnvironmentModal";
import StepsWhileLoading from "./StepsWhileLoading";

const Home = () => {
  const [current, _] = useRecoilState(currentEnvironment);
  const { status: environmentStatus } = useEnvironmentState(
    current?.environmentControllerUrl
  );

  return (
    <>
      <PageBreadcrumbs />
      <VStack spacing={6} mb={6}>
        {environmentStatus === "Enabled" && (
          <Card>
            <CardHeader>Connect to Materialize</CardHeader>
            <CardContent>
              <VStack spacing={4} alignItems="stretch">
                <PasswordStep />
                <ConnectSteps />
                <GetStartedDocs />
              </VStack>
            </CardContent>
          </Card>
        )}
        {(environmentStatus === "Starting" ||
          environmentStatus === "Loading") && <StepsWhileLoading />}
        {!current && environmentStatus === "Not enabled" && (
          <Box textAlign="center">
            <EnvironmentSelectField size="lg" margin="auto" />
          </Box>
        )}
      </VStack>
      <StarterEnvironmentModal />
    </>
  );
};

export default Home;
