import { Code, HStack, Spinner, StackProps, useTheme } from "@chakra-ui/react";
import React, { KeyboardEventHandler } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { MaterializeTheme } from "~/theme";

import CommandBlock from "./CommandBlock";
import CommandChevron from "./CommandChevron";
import { promptAtom, shellStateAtom } from "./recoil/shell";

type ShellPromptProps = StackProps & {
  onCommandBlockKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
  socketError: string | null;
};

const ShellPrompt = ({
  onCommandBlockKeyDown,
  socketError,
  ...rest
}: ShellPromptProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  const [prompt, setPrompt] = useRecoilState(promptAtom);
  const { webSocketState } = useRecoilValue(shellStateAtom);

  const isCommandProcessing =
    webSocketState !== "initialState" && webSocketState !== "readyForQuery";

  return (
    <HStack {...rest} alignItems="flex-start" p="6">
      {isCommandProcessing ? (
        <HStack color={colors.foreground.tertiary} cursor="not-allowed">
          <Spinner size="sm" thickness="1.5px" speed="0.65s" />
          <Code>Command is processing</Code>
        </HStack>
      ) : socketError ? (
        <>
          <CommandChevron color={colors.accent.red} />
          <Code color={colors.foreground.tertiary} cursor="not-allowed">
            {socketError}
          </Code>
        </>
      ) : (
        <>
          <CommandChevron />
          <CommandBlock
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onCommandBlockKeyDown}
            autoFocus={true}
            value={prompt}
            placeholder="-- write your query here"
            containerProps={{
              width: "100%",
              height: "100%",
              overflow: "auto",
            }}
          />
        </>
      )}
    </HStack>
  );
};

export default ShellPrompt;
