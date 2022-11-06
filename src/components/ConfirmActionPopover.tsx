/**
 * A component that
 */

import { HStack } from "@chakra-ui/layout";
import {
  Popover,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/popover";
import { Button, ButtonProps, Portal } from "@chakra-ui/react";
import React from "react";

const ConfirmActionPopover: React.FC<
  React.PropsWithChildren<
    {
      confirmationText: string;
      onConfirm: (onClose: () => void) => () => unknown;
    } & ButtonProps
  >
> = ({ children, confirmationText, onConfirm, disabled, ...props }) => {
  return (
    <Popover closeOnBlur={false}>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button {...props} disabled={disabled}>
              {children}
            </Button>
          </PopoverTrigger>
          <Portal>
            <PopoverContent data-testid="confirm-action-popover">
              <PopoverHeader>{confirmationText}</PopoverHeader>
              <PopoverCloseButton />
              <PopoverFooter>
                <HStack w="full" justifyContent="flex-end">
                  <Button size="sm" onClick={onClose} disabled={disabled}>
                    No
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={onConfirm(onClose)}
                    disabled={disabled}
                  >
                    Yes
                  </Button>
                </HStack>
              </PopoverFooter>
            </PopoverContent>
          </Portal>
        </>
      )}
    </Popover>
  );
};

export default ConfirmActionPopover;
