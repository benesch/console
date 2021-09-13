import { Box, Text } from "@chakra-ui/react";
import React from "react";
import { InlineWidget } from "react-calendly";
import { Redirect } from "react-router-dom";

import { useAuth } from "../api/auth";
import { BaseLayout, PageBreadcrumbs, PageHeading } from "../layouts/base";

export function WelcomePage() {
  const { user, organization } = useAuth();
  if (organization?.admitted) {
    return <Redirect to="/deployments" />;
  }
  return (
    <BaseLayout>
      <Box textAlign="center" maxWidth="1060" margin="0 auto">
        <PageBreadcrumbs></PageBreadcrumbs>
        <PageHeading>Welcome to Materialize Cloud</PageHeading>
        <Text mt="5">
          Congratulations! You're almost in. Book a free onboarding call below.
        </Text>
        <Text>
          You'll get access to Materialize Cloud during your onboarding call.
        </Text>
      </Box>
      <InlineWidget
        url="https://calendly.com/charles-materialize/materialize-cloud-onboarding"
        styles={{
          height: "750px",
        }}
        prefill={{
          name: user?.name,
          email: user?.email,
        }}
      />
    </BaseLayout>
  );
}
