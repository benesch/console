import { CheckIcon, CopyIcon, IconProps } from "@chakra-ui/icons";
import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Spacer,
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

import { semanticColors } from "~/theme/colors";

/** A hook that manage the copy mechanism and the icon state */
export const useCopyableText = (text: string, delay?: number) => {
  const { onCopy, setValue, hasCopied } = useClipboard(text, delay || 1000);

  React.useEffect(() => {
    setValue(text);
  }, [setValue, text]);

  return {
    onCopy,
    copied: hasCopied,
  };
};

export const CopyStateIcon: React.FC<
  React.PropsWithChildren<{ copied: boolean } & IconProps>
> = ({ copied }) => {
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

export const CopyButton: React.FC<
  React.PropsWithChildren<{ contents: string } & BoxProps>
> = ({ contents, ...props }) => {
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
export const CopyableBox: React.FC<
  React.PropsWithChildren<{ contents: string } & TextProps>
> = ({ contents, p, ...props }) => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
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
  React.PropsWithChildren<
    TextProps & { children: string | null; contents?: string }
  >
> = ({ contents, ...props }) => {
  const { onCopy, copied } = useCopyableText(
    contents ? contents : props.children || ""
  );
  const textColor = useColorModeValue("purple.900", "purple.100");
  const hoverColor = useColorModeValue("purple.500", "purple.300");
  if (!props.children) {
    return (
      <Text color="inherit" {...props}>
        -
      </Text>
    );
  }
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

type CodeBlockTab = {
  title: string;
  /** The code to display. */
  contents: string;
  icon?: React.ReactNode;
};

type CodeBlockExtraProps = {
  /** Whether to display line numbers. */
  lineNumbers?: boolean;
  /** Whether to force-wrap long lines. */
  wrap?: boolean;
};

type TabbedCodeBlockProps = CodeBlockExtraProps & {
  tabs: CodeBlockTab[];
};

type CodeBlockProps = CodeBlockTab & CodeBlockExtraProps;

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
export const TabbedCodeBlock: React.FC<
  React.PropsWithChildren<TabbedCodeBlockProps & BoxProps>
> = ({
  tabs,
  lineNumbers,
  wrap,
  ...props
}: TabbedCodeBlockProps & BoxProps) => {
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.title || "");
  const bg = useColorModeValue(
    semanticColors.card.bg.light,
    semanticColors.card.bg.dark
  );
  const headerBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverColor = useColorModeValue("black", "white");
  const hoverBg = useColorModeValue("whiteAlpha.400", "whiteAlpha.100");
  const activeColor = useColorModeValue("gray.800", "gray.300");
  const grayText = useColorModeValue(
    semanticColors.grayText.light,
    semanticColors.grayText.dark
  );

  if (tabs.length === 0) return null;

  const preProps: HTMLChakraProps<"pre"> = {};

  if (wrap !== false) {
    preProps.whiteSpace = "pre-wrap";
  }

  const contents =
    tabs.find((tab) => tab.title === activeTab)?.contents || tabs[0].contents;
  let codeblockInnards: React.ReactNode = contents;
  if (lineNumbers) {
    codeblockInnards = contents.split("\n").map((line, i) => (
      <Line key={`line-${i}`} index={i}>
        {line}
        {"\n"}
      </Line>
    ));
    preProps.ml = 6;
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
        alignItems="stretch"
        justifyContent="flex-start"
        pl="2"
      >
        {tabs.length > 1 ? (
          <>
            {tabs.map(({ title, icon }) => (
              <CodeBlockHeading
                key={`codeblock-tab-${title}`}
                as="button"
                onClick={() => setActiveTab(title)}
                borderBottom="1px solid"
                borderColor={title === activeTab ? activeColor : "transparent"}
                textColor={title === activeTab ? activeColor : grayText}
                _hover={{
                  textColor: hoverColor,
                  bg: hoverBg,
                }}
              >
                <Box w="4" h="4">
                  {icon}
                </Box>
                <span>{title}</span>
              </CodeBlockHeading>
            ))}
          </>
        ) : (
          <CodeBlockHeading>
            <span>{tabs[0].title}</span>
          </CodeBlockHeading>
        )}
        <Spacer />
        <CopyButton
          contents={contents}
          flex={0}
          px="4"
          py="0px"
          h="auto"
          fontSize="sm"
          borderTopRightRadius="sm"
          _hover={{
            bg: "whiteAlpha.400",
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

const CodeBlockHeading = ({ children, ...props }: BoxProps) => {
  return (
    <HStack
      fontSize="sm"
      fontWeight="400"
      flex={0}
      px={2}
      py={2}
      mb="-1px"
      textAlign="left"
      whiteSpace="nowrap"
      spacing="2"
      {...props}
    >
      {children}
    </HStack>
  );
};

export const CodeBlock: React.FC<
  React.PropsWithChildren<CodeBlockProps & BoxProps>
> = ({ title, contents, ...props }) => {
  return <TabbedCodeBlock tabs={[{ title, contents }]} {...props} />;
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
        px: 4,
        textAlign: "right",
        userSelect: "none",
        fontSize: "sm",
      }}
      sx={{ counterIncrement: "line", wordWrap: "normal" }}
    >
      {props.children}
    </chakra.span>
  );
};
