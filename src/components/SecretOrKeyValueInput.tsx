import { Button, HStack, Input, Text } from "@chakra-ui/react";
import * as React from "react";

import SimpleSelect from "./SimpleSelect";

interface SecretOrKeyValueInputProps {
  label?: string;
  children: React.ReactNode;
}

export const SecretOrKeyValueInput: React.FC<SecretOrKeyValueInputProps> = ({
  label,
  children,
}) => {
  const [isSecret, setIsSecret] = React.useState(true); // By default, we want to expose the secret selector
  return (
    <HStack align="start" justify="start" gap={6} width="460px">
      <Text as="label" py={2} fontSize="sm" fontWeight="500" lineHeight="16px">
        {label}
      </Text>
      {/* TODO: The max width of the right-side should be 320px. If the label is too long to fit in the given space, the input should reduce in size to maintain a 24px buffer */}
      {isSecret ? (
        /* TODO: This should be the auto-complete component */
        <SimpleSelect
          width="100%"
          onChange={(e) => {
            if (e.target.value === "create-secret") {
              setIsSecret(false);
            }
          }}
        >
          {children}
          <option value="create-secret">Create new secret</option>
        </SimpleSelect>
      ) : (
        <HStack width="100%" justify="start" gap={1}>
          {/* TODO: Disable 1Password from this field */}
          <Input
            name="secret-key"
            type="text"
            autoComplete="off"
            spellCheck={false}
            size="sm"
            variant="default"
            width="100%"
            placeholder="Key"
          />
          <Input
            name="secret-value"
            type="text"
            autoComplete="off"
            spellCheck={false}
            size="sm"
            variant="default"
            width="100%"
            placeholder="Value"
          />
          <Button
            variant="ghost"
            padding={0}
            size="sm"
            onClick={() => setIsSecret(true)}
          >
            {/* TODO: Replace with existing "X" icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12"
                stroke="#949197"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 4L12 12"
                stroke="#949197"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </HStack>
      )}
    </HStack>
  );
};
