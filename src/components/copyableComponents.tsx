import { CheckIcon, CopyIcon, IconProps } from "@chakra-ui/icons";
import {
  Box,
  BoxProps,
  Flex,
  Heading,
  HStack,
  Text,
  TextProps,
} from "@chakra-ui/layout";
import {
  Button,
  chakra,
  HTMLChakraProps,
  Tooltip,
  useClipboard,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

import { semanticColors } from "../theme/colors";

/** A hook that manage the copy mechanism and the icon state */
export const useCopyableText = (text: string, delay?: number) => {
  const { onCopy } = useClipboard(text);
  const [copied, setCopied] = React.useState(false);

  /** After 1s, we revert to the default state */
  const setCopiedState = React.useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), delay || 1000);
  }, [setCopied]);

  const onClickCopy = () => {
    onCopy();
    setCopiedState();
  };

  return {
    onCopy: onClickCopy,
    copied,
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
  return (
    <CopyIcon
      data-testid="copyable-copyicon"
      aria-label="Copy text"
      mt="-2px"
    />
  );
};

export const CopyButton: React.FC<{ contents: string } & BoxProps> = ({
  contents,
  ...props
}) => {
  const { onCopy, copied } = useCopyableText(contents);
  const title = copied ? "Copied" : "Copy text";
  return (
    <Box
      as="button"
      data-testid="copyable"
      title={title}
      aria-label={title}
      color={copied ? "green.400" : "gray.500"}
      _hover={{
        color: copied ? "default" : "gray.600",
      }}
      _active={{
        color: copied ? "default" : "gray.700",
      }}
      onClick={() => !copied && onCopy()}
      flex={0}
      px={3}
      {...props}
    >
      <Tooltip
        label={title}
        placement="bottom"
        fontSize="xs"
        isOpen={copied}
        top={-1}
      >
        <Box>
          <CopyStateIcon copied={copied} />
        </Box>
      </Tooltip>
    </Box>
  );
};

/** Copyable component with a bg box but no line breaks  */
export const CopyableBox: React.FC<{ contents: string } & TextProps> = ({
  contents,
  p,
  ...props
}) => {
  const bgColor = useColorModeValue("bwGray.50", "gray.800");
  return (
    <HStack
      alignItems="stretch"
      spacing={0}
      borderRadius="lg"
      bg={bgColor}
      w="full"
      fontSize="sm"
      {...props}
    >
      <Box fontFamily="mono" p={p || 2} pl={4} flex={1} wordBreak="break-all">
        {props.children}
      </Box>
      <CopyButton fontSize="md" contents={contents} w="40px" minH="full" />
    </HStack>
  );
};

/** A component that enable the children text to be copied */
export const CopyableText: React.FC<
  TextProps & { children: string | null; contents?: string }
> = ({ contents, ...props }) => {
  const { onCopy, copied } = useCopyableText(
    contents ? contents : props.children || ""
  );
  if (!props.children) {
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
        <CopyStateIcon copied={copied} />
      </HStack>
    </Button>
  );
};

interface CodeBlockProps {
  title: string;
  /** The code to display. */
  contents: string;
  /** Whether to display line numbers. */
  lineNumbers?: boolean;
  /** Whether to force-wrap long lines. */
  wrap?: boolean;
}

/**
 * A nicely-formatted block of code.
 *
 * Code blocks render their contents in monospace and present a "copy to
 * clipboard" button when hovered over. They are offset from their surroundings
 * by a small margin, but style properties are passed through to their
 * container.
 *
 * By default, code blocks are the width of their parent and any overflow
 * results in scroll bars. Setting `wrap` to `true` will cause long lines to
 * wrap instead.
 */
export const CodeBlock: React.FC<CodeBlockProps & BoxProps> = ({
  title,
  wrap,
  lineNumbers,
  contents,
  ...props
}) => {
  const bg = useColorModeValue(
    semanticColors.card.bg.light,
    semanticColors.card.bg.dark
  );
  const headerBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue(
    semanticColors.divider.light,
    semanticColors.divider.dark
  );

  const preProps: HTMLChakraProps<"pre"> = {};

  if (wrap !== false) {
    preProps.whiteSpace = "pre-wrap";
  }

  let codeblockInnards: React.ReactNode = props.children || contents;
  if (lineNumbers) {
    codeblockInnards = contents.split("\n").map((line, i) => (
      <Line key={`line-${i}`} index={i}>
        {line}
        {"\n"}
      </Line>
    ));
    preProps.ml = 6;
    preProps.borderLeft = "1px solid";
    preProps.borderLeftColor = borderColor;
  }

  return (
    <Box
      bg={bg}
      role="group"
      position="relative"
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      w="full"
      textAlign="left"
      {...props}
    >
      <Flex
        borderBottom="1px"
        bg={headerBg}
        borderColor={borderColor}
        borderTopLeftRadius="md"
        borderTopRightRadius="md"
        w="full"
        alignItems="center"
      >
        <Heading
          size="xs"
          fontWeight="400"
          flex={1}
          px={2}
          py={1}
          textAlign="left"
        >
          {title}
        </Heading>
        <CopyButton
          contents={contents}
          flex={0}
          px="4px"
          py="0px"
          mr="2px"
          h="auto"
          fontSize="sm"
          borderRadius="md"
          _hover={{
            bg: "gray.100",
          }}
        />
      </Flex>
      <chakra.pre
        fontSize={props.fontSize || "sm"}
        py={2}
        pl={4}
        pr={8}
        overflow="auto"
        sx={{ wordWrap: "normal" }}
        {...preProps}
      >
        {codeblockInnards}
      </chakra.pre>
    </Box>
  );
};

interface LineProps {
  index: number;
  children: React.ReactNode;
}

const Line = (props: LineProps) => {
  const grayText = useColorModeValue(
    semanticColors.grayText.light,
    semanticColors.grayText.dark
  );
  return (
    <chakra.span
      fontSize="xs"
      _before={{
        content: "counter(line)",
        color: grayText,
        position: "absolute",
        left: "0",
        px: 2,
        textAlign: "right",
        "user-select": "none",
      }}
      sx={{ "counter-increment": "line", wordWrap: "normal" }}
    >
      {props.children}
    </chakra.span>
  );
};
