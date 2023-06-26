import { Button, ButtonProps } from "@chakra-ui/react";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import PlayIcon from "~/svg/PlayIcon";
import StopIcon from "~/svg/StopIcon";

import { promptAtom, shellStateAtom } from "./recoil/shell";

type RunCommandButtonProps = ButtonProps & {
  runCommand: (command: string) => void;
  socketError: string | null;
  cancelStreaming: () => void;
};

const RunCommandButton = ({
  socketError,
  runCommand,
  cancelStreaming,
  ...rest
}: RunCommandButtonProps) => {
  const [prompt, setPrompt] = useRecoilState(promptAtom);
  const { webSocketState } = useRecoilValue(shellStateAtom);

  const isStreaming = webSocketState === "commandInProgressStreaming";

  const isCommandProcessing =
    webSocketState !== "initialState" && webSocketState !== "readyForQuery";

  const isButtonDisabled = !isStreaming && isCommandProcessing;

  return (
    <Button
      variant={isStreaming ? "primary" : "tertiary"}
      position="absolute"
      right="6"
      bottom="6"
      leftIcon={isStreaming ? <StopIcon /> : <PlayIcon />}
      onClick={() => {
        if (isStreaming) {
          cancelStreaming();
        } else {
          runCommand(prompt);
          setPrompt("");
        }
      }}
      {...rest}
      isDisabled={isButtonDisabled}
    >
      {isStreaming ? "Stop Streaming" : "Run Query"}
    </Button>
  );
};

export default RunCommandButton;
