import { Button, ButtonProps } from "@chakra-ui/react";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import PlayIcon from "~/svg/PlayIcon";

import { promptAtom, shellStateAtom } from "./recoil/shell";

type RunCommandButtonProps = ButtonProps & {
  runCommand: (command: string) => void;
  socketError: string | null;
};

const RunCommandButton = ({
  socketError,
  runCommand,
  ...rest
}: RunCommandButtonProps) => {
  const [prompt, setPrompt] = useRecoilState(promptAtom);
  const { webSocketState } = useRecoilValue(shellStateAtom);

  const isCommandProcessing =
    webSocketState !== "initialState" && webSocketState !== "readyForQuery";

  return (
    <Button
      variant="tertiary"
      position="absolute"
      right="6"
      bottom="6"
      leftIcon={<PlayIcon />}
      onClick={() => {
        runCommand(prompt);
        setPrompt("");
      }}
      {...rest}
      disabled={isCommandProcessing || !!socketError}
    >
      Run Query
    </Button>
  );
};

export default RunCommandButton;
