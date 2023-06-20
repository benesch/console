import {
  Button,
  Text,
  useTheme,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import * as React from "react";

import { MaterializeTheme } from "~/theme";

export type DocsLink = {
  label: string;
  href: string;
  icon: React.ReactElement;
};

export interface DocsCalloutProps {
  title: string;
  description: string;
  docsLinks: DocsLink[];
}

export const DocsCallout = ({
  title,
  description,
  docsLinks,
}: DocsCalloutProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <VStack align="start" spacing={4}>
      <VStack align="start" spacing={2}>
        <Text textStyle="text-ui-med" color={semanticColors.foreground.primary}>
          {title}
        </Text>
        <Text textStyle="text-base" color={semanticColors.foreground.secondary}>
          {description}
        </Text>
      </VStack>
      <Wrap spacing="2">
        {docsLinks.map(({ label, href, icon }) => (
          <WrapItem key={label}>
            <Button
              as="a"
              variant="outline"
              size="sm"
              height="10"
              px="4"
              leftIcon={icon}
              href={href}
              target="_blank"
            >
              {label}
            </Button>
          </WrapItem>
        ))}
      </Wrap>
    </VStack>
  );
};
