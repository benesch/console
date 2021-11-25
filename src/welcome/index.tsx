/**
 * @module
 * Temporary welcome page.
 *
 * This page forces users to sign up for an onboarding call before they can
 * access Materialize Cloud. We plan to lift this restriction soon, at which
 * point we can remove this page.
 */

import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import format from "date-fns/format";
import React from "react";
import { InlineWidget } from "react-calendly";

import { useOnboardingCallRetrieve } from "../api/api";
import { useAuth } from "../api/auth";
import {
  Card,
  CardContent,
  CardField,
  CardFooter,
  CardHeader,
} from "../components/card";
import { SupportLink } from "../components/cta";
import { BaseLayout, PageBreadcrumbs, PageHeading } from "../layouts/base";

export function WelcomePage() {
  const { user } = useAuth();
  const { data: onboardingCall, loading: onboardingCallLoading } =
    useOnboardingCallRetrieve({});

  let contents;
  if (onboardingCallLoading) {
    contents = <Spinner />;
  } else if (onboardingCall) {
    const startDate = Date.parse(onboardingCall.start);
    const endDate = Date.parse(onboardingCall.end);
    contents = (
      <>
        <Text>Congratulations! You're almost in.</Text>
        <Text>
          You'll get access to Materialize Cloud during your scheduled
          onboarding call.
        </Text>
        <Box mt="7" mx="auto" width="sm">
          <Card>
            <CardHeader>Onboarding Call</CardHeader>
            <CardContent>
              <VStack spacing="3" align="left">
                <CardField name="Date">
                  {format(startDate, "MMMM dd, yyyy")}
                </CardField>
                <CardField name="Time">
                  {format(startDate, "hh:mmaaa")}
                  {" – "}
                  {format(endDate, "hh:mmaaa")}
                </CardField>
              </VStack>
            </CardContent>
            <CardFooter>
              <Text>
                Need to reschedule? <SupportLink>Contact us.</SupportLink>
              </Text>
            </CardFooter>
          </Card>
        </Box>
      </>
    );
  } else {
    contents = (
      <>
        <Text>
          Congratulations! You're almost in. Book an onboarding call below.
        </Text>
        <Text>
          You'll get access to Materialize Cloud during your onboarding call.
        </Text>
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
      </>
    );
  }

  return (
    <BaseLayout>
      <Box textAlign="center" maxWidth="1060" margin="0 auto">
        <PageBreadcrumbs></PageBreadcrumbs>
        <PageHeading>Welcome to Materialize Cloud</PageHeading>
        <Box mt="5">{contents}</Box>
      </Box>
    </BaseLayout>
  );
}
