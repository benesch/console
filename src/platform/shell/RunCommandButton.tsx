import { Button, ButtonProps } from "@chakra-ui/react";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import PlayIcon from "~/svg/PlayIcon";
import StopIcon from "~/svg/StopIcon";

import { promptAtom, shellStateAtom } from "./recoil/shell";

type RunCommandButtonProps = ButtonProps & {
  runCommand: (command: string) => void;
  isSocketAvailable: boolean;
  cancelStreaming: () => void;
};

const RunCommandButton = ({
  isSocketAvailable,
  runCommand,
  cancelStreaming,
  ...rest
}: RunCommandButtonProps) => {
  const [prompt, setPrompt] = useRecoilState(promptAtom);
  const { webSocketState } = useRecoilValue(shellStateAtom);

  const isStreaming = webSocketState === "commandInProgressStreaming";

  const isCommandProcessing =
    webSocketState !== "initialState" && webSocketState !== "readyForQuery";

  const isLoading = !isStreaming && isCommandProcessing;

  const isButtonDisabled = !isSocketAvailable || isLoading;

  const buttonText = isStreaming ? "Stop Streaming" : "Run Query";

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
      isDisabled={isButtonDisabled}
      loadingText={buttonText}
      isLoading={isLoading}
      {...rest}
    >
      {buttonText}
    </Button>
  );
};

export default RunCommandButton;
