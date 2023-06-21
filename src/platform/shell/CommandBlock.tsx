import { Code, CodeProps, useTheme } from "@chakra-ui/react";
import CodeEditor, {
  TextareaCodeEditorProps,
} from "@uiw/react-textarea-code-editor";
import React from "react";

import { MaterializeTheme } from "~/theme";

type CommandBlockProps = TextareaCodeEditorProps & {
  containerProps?: CodeProps;
  textAreaStyleProps?: React.CSSProperties;
};

export const CommandBlock = (props: CommandBlockProps) => {
  const theme = useTheme<MaterializeTheme>();

  const handleKeyDown = props.readOnly
    ? () => {
        /* 
          Weird bug where even if the textarea is readonly, react-textarea-code-editor 
          will still update the value when pressing "tab". 
          A fix for this is to return false in onKeyDown's
          event handler.
        */
        return false;
      }
    : props.onKeyDown;

  return (
    <Code {...(props.containerProps ?? {})}>
      <CodeEditor
        language="sql"
        style={{
          backgroundColor: "transparent",
          fontSize: theme.fontSizes.sm as string,
          ...(props.textAreaStyleProps ?? {}),
        }}
        padding={0}
        autoComplete="false"
        autoCorrect="false"
        onKeyDown={handleKeyDown}
        {...props}
      />
    </Code>
  );
};

export default CommandBlock;
