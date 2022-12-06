import { HStack, Spinner } from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router-dom";

import { Source, useDDL } from "~/api/materialized";
import { PageBreadcrumbs, PageHeader } from "~/layouts/BaseLayout";

export interface SourceDetailProps {
  source?: Source;
}

const SourceDetail = ({ source }: SourceDetailProps) => {
  const params = useParams();
  const { ddl } = useDDL("SOURCE", source?.name);

  return (
    <>
      <PageHeader>
        <PageBreadcrumbs crumbs={["Sources", params.sourceName ?? ""]} />
        {source && (
          <ExpandablePanel text="SHOW CREATE SINK">{ddl}</ExpandablePanel>
        )}
      </PageHeader>
      <HStack spacing={6} alignItems="flex-start">
        {source ? <div>{source.name}</div> : <Spinner />}
      </HStack>
    </>
  );
};

export interface ExpandablePanelProps {
  text: string;
  children: React.ReactNode;
}

const ExpandablePanel = ({ text, children }: ExpandablePanelProps) => {
  const [show, setShow] = React.useState(false);
  return (
    <>
      <div onClick={() => setShow(!show)}>{text}</div>
      {show && children}
    </>
  );
};

export default SourceDetail;
