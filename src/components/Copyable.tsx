/**
 * This component offers a convenient interface to text that can be copied.
 * It does not enforce any formatting and exposes styling props via the `@chakra-ui`'s text interface.
 */

import { CheckIcon, CopyIcon, IconProps } from "@chakra-ui/icons";
import { HStack, Text, TextProps } from "@chakra-ui/layout";
import {
  Button,
  ButtonProps,
  useClipboard,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

/** A hook that manage the copy mechanism and the icon state */
export const useCopyableText = (text: string) => {
  const [copied, setCopied] = React.useState(false);

  /** After 1s, we revert to the default state */
  const setCopiedState = React.useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, [setCopied]);

  const onCopy = () => {
    navigator.clipboard.writeText(text);
    setCopiedState();
  };

  const shouldDisplayIcon = text !== "";

  return {
    onCopy,
    copied,
    shouldDisplayIcon,
  };
};

export const CopyStateIcon: React.FC<{ copied: boolean } & IconProps> = ({
  copied,
}) => {
  if (copied)
    return (
      <CheckIcon
        data-testid="copyable-checkicon"
        aria-label="Text has been copied"
      />
    );
  return <CopyIcon data-testid="copyable-copyicon" aria-label="Copy text" />;
};

/** A component that enable the children text to be copied */
export const CopyableText: React.FC<TextProps & { children: string | null }> = (
  props
) => {
  const content = props.children ?? "";
  const { onCopy, copied, shouldDisplayIcon } = useCopyableText(content);
  if (!content) {
    return (
      <Text color="inherit" {...props}>
        -
      </Text>
    );
  }
  const textColor = useColorModeValue("purple.900", "purple.100");
  const hoverColor = useColorModeValue("purple.500", "purple.300");
  return (
    <Button
      variant="link"
      onClick={onCopy}
      fontWeight="normal"
      color={textColor}
      title={props.title || "Copy"}
      sx={{
        ":hover": {
          color: hoverColor,
        },
      }}
      maxW="100%"
    >
      <HStack alignItems="flex-start" py={1} width="100%">
        <Text color="inherit" {...props}></Text>
        {shouldDisplayIcon && <CopyStateIcon copied={copied} />}
      </HStack>
    </Button>
  );
};

interface CopyButtonProps extends ButtonProps {
  contents: string;
}

export const CopyButton = ({ contents, ...props }: CopyButtonProps) => {
  const { onCopy } = useClipboard(contents);
  const buttonBg = useColorModeValue("white", "black");

  return (
    <Button
      leftIcon={<CopyIcon />}
      opacity="0"
      position="absolute"
      _groupHover={{ opacity: 1 }}
      size="xs"
      bg={buttonBg}
      colorScheme="purple"
      variant="outline"
      top="2"
      right="2"
      transition="opacity 0.1s"
      {...props}
      onClick={onCopy}
    >
      Copy
    </Button>
  );
};
