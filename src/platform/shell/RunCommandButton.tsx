import { Button, ButtonProps } from "@chakra-ui/react";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import PlayIcon from "~/svg/PlayIcon";
import StopIcon from "~/svg/StopIcon";

import { promptAtom, shellStateAtom } from "./recoil/shell";

type RunCommandButtonProps = ButtonProps & {
  runCommand: (command: string) => void;
  socketError: string | null;
  restartSocket: () => void;
};

const RunCommandButton = ({
  socketError,
  runCommand,
  restartSocket,
  ...rest
}: RunCommandButtonProps) => {
  const [prompt, setPrompt] = useRecoilState(promptAtom);
  const { webSocketState } = useRecoilValue(shellStateAtom);

  const isSubscribing = webSocketState === "commandInProgressStreaming";

  const isCommandProcessing =
    webSocketState !== "initialState" && webSocketState !== "readyForQuery";

  const isButtonDisabled = !isSubscribing && isCommandProcessing;

  return (
    <Button
      variant={isSubscribing ? "primary" : "tertiary"}
      position="absolute"
      right="6"
      bottom="6"
      leftIcon={isSubscribing ? <StopIcon /> : <PlayIcon />}
      onClick={() => {
        if (isSubscribing) {
          restartSocket();
        } else {
          runCommand(prompt);
          setPrompt("");
        }
      }}
      {...rest}
      isDisabled={isButtonDisabled}
    >
      {isSubscribing ? "Stop Streaming" : "Run Query"}
    </Button>
  );
};

export default RunCommandButton;
