/**
 * @module
 * A code block.
 */

import { CopyIcon } from "@chakra-ui/icons";
import {
  Box,
  BoxProps,
  Button,
  chakra,
  HTMLChakraProps,
  useClipboard,
} from "@chakra-ui/react";
import React from "react";

export interface CodeBlockProps extends BoxProps {
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
export function CodeBlock({
  wrap,
  lineNumbers,
  contents,
  ...props
}: CodeBlockProps) {
  const { onCopy } = useClipboard(contents);

  const preProps: HTMLChakraProps<"pre"> = {};

  if (wrap !== false) {
    preProps.whiteSpace = "pre-wrap";
  }

  let children: React.ReactNode;
  if (lineNumbers) {
    children = contents.split("\n").map((line, i) => (
      <Line index={i}>
        {line}
        {"\n"}
      </Line>
    ));
    preProps.ml = "5em";
    preProps.borderLeft = "1px solid";
    preProps.borderLeftColor = "gray.200";
  } else {
    children = contents;
  }

  return (
    <Box bg="gray.100" mt="3" role="group" position="relative" {...props}>
      <Button
        onClick={onCopy}
        leftIcon={<CopyIcon />}
        opacity="0"
        position="absolute"
        _groupHover={{ opacity: 1 }}
        size="xs"
        bg="white"
        colorScheme="purple"
        variant="outline"
        top="2"
        right="2"
        transition="opacity 0.1s"
      >
        Copy
      </Button>
      <chakra.pre
        fontSize="sm"
        p="3"
        overflow="scroll"
        sx={{ "word-wrap": "normal" }}
        {...preProps}
      >
        {children}
      </chakra.pre>
    </Box>
  );
}

interface LineProps {
  index: number;
  children: React.ReactNode;
}

function Line(props: LineProps) {
  return (
    <chakra.span
      _before={{
        content: "counter(line)",
        color: "gray.600",
        width: "5em",
        position: "absolute",
        left: "0",
        pr: "1em",
        textAlign: "right",
        "user-select": "none",
      }}
      sx={{ "counter-increment": "line", "word-wrap": "normal" }}
    >
      {props.children}
    </chakra.span>
  );
}
