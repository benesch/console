import { Button } from "@chakra-ui/react";
import React from "react";

import FullScreen from "~/components/FullScreen";
import FormTopBar from "~/components/TopBarForm";

const NewClusterForm = () => {
  return (
    <FullScreen>
      <FormTopBar title="New Cluster">
        <Button
          variant="primary"
          size="sm"
          onClick={() => console.log("create")}
        >
          Create cluster
        </Button>
      </FormTopBar>
    </FullScreen>
  );
};

export default NewClusterForm;
