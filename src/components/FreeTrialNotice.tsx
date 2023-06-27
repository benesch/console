import { Box, BoxProps, Button, Text, useTheme } from "@chakra-ui/react";
import { differenceInDays } from "date-fns";
import React from "react";

import { useCurrentOrganization } from "~/api/auth";
import infoSvg from "~/img/info.svg";
import { MaterializeTheme } from "~/theme";

const FreeTrialNotice = (props: BoxProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  const { organization } = useCurrentOrganization();

  if (!organization || !organization.trialExpiresAt) return null;

  const trialExpiresAt = new Date(organization.trialExpiresAt);
  const now = new Date();
  const daysRemaining = differenceInDays(trialExpiresAt, now);
  const expired = trialExpiresAt <= now;
  return (
    <Box
      borderWidth="1px"
      borderColor={colors.border.info}
      borderRadius="8"
      background={colors.background.info}
      p="4"
      display={{ base: "none", lg: "block" }}
      {...props}
    >
      <Text
        display="flex"
        textStyle="text-small"
        color={colors.foreground.secondary}
      >
        Free trial
        <Box
          as="a"
          href="https://materialize.com/docs/free-trial-faqs/"
          ml="1"
          rel="noopener"
          target="_blank"
        >
          <img src={infoSvg} alt="info" />
        </Box>
      </Text>
      <Text mt="1" textStyle="heading-sm">
        {expired
          ? "Trial Expired"
          : `${daysRemaining} ${
              daysRemaining === 1 ? "day" : "days"
            } remaining`}
      </Text>
      <Button
        as="a"
        href="https://materialize.com/convert-account/"
        mt="4"
        rel="noopener noreferrer"
        size="sm"
        target="_blank"
        variant="primary"
        width="100%"
      >
        Contact our team
      </Button>
    </Box>
  );
};

export default FreeTrialNotice;
