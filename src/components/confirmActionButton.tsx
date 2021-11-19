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

export const ConfirmActionButton: React.FC<
  { confirmationText: string; onConfirm: () => void } & ButtonProps
> = ({ children, confirmationText, onConfirm, ...props }) => {
  return (
    <Popover closeOnBlur={false}>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button {...props}>{children}</Button>
          </PopoverTrigger>
          <Portal>
            <PopoverContent data-testid="confirm-action-popover">
              <PopoverHeader>{confirmationText}</PopoverHeader>
              <PopoverCloseButton />
              <PopoverFooter>
                <HStack w="full" justifyContent="flex-end">
                  <Button size="sm" onClick={onClose}>
                    No
                  </Button>
                  <Button size="sm" colorScheme="red" onClick={onConfirm}>
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
