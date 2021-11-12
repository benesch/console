import { Collapse, HStack, Slide, Text, VStack } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";

import { Deployment } from "../../../../api/api";
import {
  SubmitButton,
  SwitchField,
  TextField,
} from "../../../../components/form";
import { useComputedFields, useTailscaleIntegration } from "./hooks";

export const TailscaleIntegration: React.FC = () => {
  const tailscale = useTailscaleIntegration();
  return (
    <Formik
      initialValues={tailscale.defaultValues}
      onSubmit={(values) => tailscale.savePreferences(values)}
    >
      <TailscaleIntegrationForm />
    </Formik>
  );
};

export const TailscaleIntegrationForm = () => {
  const { shouldDisabledTailscaleAuthKey, shouldShowAdditionalFields } =
    useComputedFields();
  return (
    <Form>
      <VStack w="full" alignItems="flex-start" px={4}>
        <Text>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo.
        </Text>
        <HStack>
          <Text flexShrink={0}>Enable integration</Text>
          <SwitchField label="" id="enableTailscale"></SwitchField>
        </HStack>

        <Collapse in={shouldShowAdditionalFields} animateOpacity>
          <Text color="gray.400">Additional fields</Text>
          <TextField
            disabled
            name="tailscaleAuthKey"
            label="Tailscale Auth Key"
          ></TextField>
          <SubmitButton>Save</SubmitButton>
        </Collapse>
      </VStack>
    </Form>
  );
};
