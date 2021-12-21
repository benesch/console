import { Link } from "@chakra-ui/react";
import * as React from "react";

import { getReleaseNotesRootURL } from "./releaseNote";

const ReleaseNoteLink: React.FC = () => {
  return (
    <Link href={getReleaseNotesRootURL() ?? ""} isExternal>
      Release Notes
    </Link>
  );
};

export default ReleaseNoteLink;
