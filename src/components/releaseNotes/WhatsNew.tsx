import { Link, Tag } from "@chakra-ui/react";
import React from "react";

import { useWhatsNew } from "./hook";

const WhatsNew = () => {
  const { visible, onLinkClicked, releaseNoteLink } = useWhatsNew();
  if (!(visible && releaseNoteLink)) return null;

  return (
    <Tag
      as={Link}
      onClick={onLinkClicked}
      isExternal
      href={releaseNoteLink}
      background="whiteAlpha.300"
      color="white"
    >
      ✨ What's new
    </Tag>
  );
};

export default WhatsNew;
