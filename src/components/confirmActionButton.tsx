/**
 * A component that
 */

import { Box, HStack } from "@chakra-ui/layout";
import {
  Popover,
  PopoverBody,
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
            <PopoverContent>
              <PopoverHeader>{confirmationText}</PopoverHeader>
              <PopoverCloseButton />
              <PopoverFooter>
                <HStack alignItems="self-end">
                  <Button size="sm" onClick={onClose}>
                    No, Cancel
                  </Button>
                  <Button size="sm" colorScheme="blue" onClick={onConfirm}>
                    Yes, Disable
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
