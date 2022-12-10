import { IconProps } from "@chakra-ui/icons";
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
  useTheme,
} from "@chakra-ui/react";
import React from "react";

import CheckmarkIcon from "~/svg/CheckmarkIcon";
import CopyIcon from "~/svg/CopyIcon";
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
      <CheckmarkIcon
        data-testid="copyable-checkicon"
        aria-label="Text has been copied"
      />
    );
  return <CopyIcon data-testid="copyable-copyicon" aria-label="Copy text" />;
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
  const { colors } = useTheme();
  return (
    <HStack
      alignItems="stretch"
      spacing={0}
      borderRadius="lg"
      bg={colors.semanticColors.background.secondary}
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
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.title || "");

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
      bg={colors.semanticColors.background.primary}
      role="group"
      position="relative"
      border="1px"
      borderColor={colors.semanticColors.border.primary}
      borderRadius="md"
      w="full"
      textAlign="left"
      {...props}
    >
      <Flex
        borderBottom="1px"
        bg={colors.semanticColors.background.secondary}
        borderColor={colors.semanticColors.border.primary}
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
                borderColor={
                  title === activeTab
                    ? colors.semanticColors.foreground.primary
                    : "transparent"
                }
                textColor={
                  title === activeTab
                    ? colors.semanticColors.foreground.primary
                    : colors.semanticColors.foreground.secondary
                }
                _hover={{
                  bg: colors.semanticColors.foreground.tertiary,
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
        fontSize="sm"
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
  const { colors } = useTheme();
  return (
    <chakra.span
      fontSize="sm"
      _before={{
        content: "counter(line)",
        color: colors.semanticColors.foreground.secondary,
        opacity: 0.7,
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
