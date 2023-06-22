import { HStack, StackProps } from "@chakra-ui/react";
import React, { KeyboardEventHandler } from "react";
import { useRecoilState } from "recoil";

import CommandBlock from "./CommandBlock";
import CommandChevron from "./CommandChevron";
import { promptAtom } from "./recoil/shell";

type ShellPromptProps = StackProps & {
  onCommandBlockKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
};

const ShellPrompt = ({ onCommandBlockKeyDown, ...rest }: ShellPromptProps) => {
  const [prompt, setPrompt] = useRecoilState(promptAtom);

  return (
    <HStack {...rest} alignItems="flex-start" p="6">
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
    </HStack>
  );
};

export default ShellPrompt;
