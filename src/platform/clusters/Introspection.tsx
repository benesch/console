import { Button, HStack, VStack } from "@chakra-ui/react";
import * as d3 from "d3";
import { graphviz } from "d3-graphviz";
import React from "react";
import { useParams } from "react-router-dom";

import {
  Channel,
  Operator,
  useDataflowStructure,
} from "~/api/materialize/useDataflowStructure";
import { Replica } from "~/api/materialized";
import LabeledSelect from "~/components/LabeledSelect";
import { assert } from "~/util";

interface EnrichedOperator extends Operator {
  // First-level.
  channelsInScope: Channel[];
  children: EnrichedOperator[];
  transitiveArrangementRecords: number;
}

function groupBy<T, K>(values: T[], group: (item: T) => K): Map<K, T[]> {
  const output = new Map();
  for (const v of values) {
    const k = group(v);
    if (!output.has(k)) {
      output.set(k, []);
    }
    output.get(k)!.push(v);
  }
  return output;
}

// Returns a map of operator ID to corresponding operators,
// as well as a designated root.
function collateOperators(
  operators: Operator[],
  channels: Channel[]
): [Map<number, EnrichedOperator>, EnrichedOperator] {
  const scopes = groupBy(operators, (o) => o.parentId);
  const channelsByFrom = groupBy(channels, (ch) => ch.fromOperatorId);

  const roots = scopes.get(null) || [];

  function walk(
    op: Operator,
    m: Map<number, EnrichedOperator>
  ): EnrichedOperator {
    assert(!m.has(op.id));
    const children = (scopes.get(op.id) || []).map((ch) => walk(ch, m));
    const channelsInScope = children
      .map((ch) => channelsByFrom.get(ch.id) || [])
      .flat(1);
    const ret = {
      ...op,
      children,
      channelsInScope,
      transitiveArrangementRecords:
        children
          .map((child) => child.transitiveArrangementRecords)
          .reduce((a, b) => a + b, 0) + op.arrangementRecords,
    };
    m.set(ret.id, ret);
    return ret;
  }

  const m = new Map();

  const enrichedRoots = roots.map((r) => walk(r, m));
  assert(enrichedRoots.length == 1);
  return [m, enrichedRoots[0]];
}

const noArrangementRegionColor = "#12b886";
const noArrangementOperatorColor = "#ffffff";
const arrangementRegionColor = "#7950f2";
const arrangementOperatorColor = "#fab005";

function scopeToGv(scope: EnrichedOperator): string {
  const chunks = ["digraph {", 'node [style="filled"];'];
  for (const op of scope.children) {
    const isRegion = op.children.length !== 0;
    const hasArrangedData = op.transitiveArrangementRecords > 0;
    let fillColor;
    if (isRegion) {
      if (hasArrangedData) {
        fillColor = arrangementRegionColor;
      } else {
        fillColor = noArrangementRegionColor;
      }
    } else {
      if (hasArrangedData) {
        fillColor = arrangementOperatorColor;
      } else {
        fillColor = noArrangementOperatorColor;
      }
    }
    const nodeLabelFields = [op.name];
    if (hasArrangedData) {
      nodeLabelFields.push(
        `${op.transitiveArrangementRecords} arranged records`
      );
    }
    if (op.elapsedNs > 0) {
      nodeLabelFields.push(`scheduled ${op.elapsedNs / 1_000_000_000} seconds`);
    }

    const nodeGv = `"${op.id}" [fillcolor="${fillColor}",id="${
      op.id
    }",label="${nodeLabelFields.join("\n")}",class="${
      isRegion ? "region" : ""
    }"];`;
    chunks.push(nodeGv);
  }
  for (const ch of scope.channelsInScope) {
    const chanLabel = ch.messagesSent > 0 ? `sent ${ch.messagesSent}` : "";
    const chanGv = `${ch.fromOperatorId} -> ${ch.toOperatorId} [label="${chanLabel}"];`;
    chunks.push(chanGv);
  }
  chunks.push("}");
  return chunks.join("\n");
}

interface DotVizProps {
  dot?: string;
  onClickedNode: (id: number) => void;
}

const DotViz = ({ dot, onClickedNode }: DotVizProps) => {
  const d3Container = React.useRef(null);
  React.useEffect(() => {
    if (d3Container.current && dot) {
      const gv = graphviz(d3Container.current);
      gv.on("initEnd", () => {
        gv.renderDot(dot, function () {
          gv.resetZoom();
          const regions = d3.selectAll(".region");
          regions.on("dblclick", function (event) {
            const clickedId = Number(event.currentTarget.getAttribute("id"))!;
            if (clickedId) {
              event.stopPropagation();
              onClickedNode(clickedId);
            }
          });
        });
      });
    }
  }, [dot, onClickedNode]);
  return <div ref={d3Container} />;
};

interface DFVizProps {
  replicas: Replica[];
}

const DFViz = (props: DFVizProps) => {
  const p = useParams();
  const [scopeBreadcrumb, setScopeBreadcrumb] = React.useState<number[]>([]);
  const [replicaName, setReplicaName] = React.useState<string | null>(
    props.replicas.length > 0 ? props.replicas[0].name : null
  );
  const { clusterName, id } = p;
  // Reset scope if props changed.
  // TODO - If we track scopes by
  // address, rather than by operator ID, we can avoid resetting it
  // when replica name changes (addresses other than the initial component
  // are the same across replicas, whereas operator IDs aren't
  React.useEffect(() => {
    setScopeBreadcrumb([]);
  }, [clusterName, id, replicaName]);
  const dfStructureParams = React.useMemo(
    () =>
      clusterName && id && replicaName
        ? { clusterName, replicaId: replicaName, objectId: id }
        : undefined,
    [clusterName, id, replicaName]
  );
  const x = useDataflowStructure(dfStructureParams);
  const { data: structure } = x || {};
  const [allEnriched, root] = React.useMemo(() => {
    return structure
      ? collateOperators(structure.operators, structure.channels)
      : [null, null];
  }, [structure]);
  const scopeOperator =
    scopeBreadcrumb.length > 0 && allEnriched
      ? allEnriched.get(scopeBreadcrumb[scopeBreadcrumb.length - 1])!
      : root;
  const dot = React.useMemo(() => {
    return scopeOperator ? scopeToGv(scopeOperator) : undefined;
  }, [scopeOperator]);

  const pushScope = React.useCallback(
    (s: number) => {
      const newBreadcrumb = [...scopeBreadcrumb, s];
      setScopeBreadcrumb(newBreadcrumb);
    },
    [scopeBreadcrumb, setScopeBreadcrumb]
  );

  return (
    <VStack>
      {replicaName && (
        <LabeledSelect
          label="Replicas"
          value={replicaName}
          onChange={(e) => setReplicaName(e.target.value)}
        >
          {props.replicas.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </LabeledSelect>
      )}
      <HStack>
        <Button
          size="xs"
          onClick={() => setScopeBreadcrumb([])}
          isDisabled={scopeBreadcrumb.length === 0}
        >
          {"<<"}
        </Button>{" "}
        <Button
          size="xs"
          onClick={() => setScopeBreadcrumb(scopeBreadcrumb.slice(0, -1))}
          isDisabled={scopeBreadcrumb.length === 0}
        >
          {"<"}
        </Button>
      </HStack>
      <DotViz dot={dot} onClickedNode={pushScope} />
    </VStack>
  );
};

export default DFViz;
