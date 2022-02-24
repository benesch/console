import { Box, BoxProps, Link, Tooltip } from "@chakra-ui/react";
import React, { MouseEventHandler } from "react";

import { useWhatsNew } from "./hook";

const WhatsNew = (props: BoxProps) => {
  const { visible, onLinkClicked, releaseNoteLink } = useWhatsNew();
  const onClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    onLinkClicked();
  };
  if (!(visible && releaseNoteLink)) return null;

  return (
    <Box {...props}>
      <Tooltip label="What's new" fontSize="xs" placement="right">
        <Box
          as={Link}
          onClick={onClick}
          isExternal
          href={releaseNoteLink}
          bg="whiteAlpha.400"
          _hover={{ background: "whiteAlpha.600", textDecoration: "none" }}
          borderRadius="xl"
          px="1"
          py="1"
          fontSize="xs"
          rounded="full"
          h="5"
          w="5"
          color="purple.900"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          ✨
        </Box>
      </Tooltip>
    </Box>
  );
};

export default WhatsNew;
