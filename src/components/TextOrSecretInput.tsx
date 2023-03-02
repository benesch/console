import {
  Button,
  HStack,
  Input,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import * as React from "react";

import { MaterializeTheme } from "~/theme";

import SimpleSelect from "./SimpleSelect";

interface TextOrSecretInputProps {
  label?: string;
  children: React.ReactNode;
}

export const TextOrSecretInput: React.FC<TextOrSecretInputProps> = ({
  label,
  children,
}) => {
  const [isSecret, setIsSecret] = React.useState(false);
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <HStack align="start" justify="start" gap={6} width="460px">
      <Text as="label" py={2} fontSize="sm" fontWeight="500" lineHeight="16px">
        {label}
      </Text>
      <VStack align="start" width="100%" maxW="320px">
        {/* TODO: The max width of the right-side should be 320px. If the label is too long to fit in the given space, the input should reduce in size to maintain a 24px buffer */}
        {isSecret ? (
          /* TODO: This should be the auto-complete component */
          <SimpleSelect width="100%">{children}</SimpleSelect>
        ) : (
          <Input size="sm" variant="default" width="100%" />
        )}
        <Text
          fontSize="12px"
          lineHeight="16px"
          fontWeight={400}
          color={semanticColors.foreground.secondary}
        >
          If you prefer,{" "}
          <Button
            variant="link"
            fontSize="12px"
            lineHeight="16px"
            fontWeight={400}
            color={semanticColors.accent.brightPurple}
            onClick={() => setIsSecret(!isSecret)}
          >
            {isSecret /* TODO: Change label based on active input */
              ? "use plain text"
              : "use a secret"}
          </Button>
          .
        </Text>
      </VStack>
    </HStack>
  );
};
