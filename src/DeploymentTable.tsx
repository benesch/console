import React from "react";
import type { Deployment, PendingMigration } from "./api";
import { Button, Header, Segment, Loader, Table } from "semantic-ui-react";

type DeploymentTableProps = {
  deployments: Deployment[];
  versionMap: { [track: string]: string };
  warning: PendingMigration | null;
  setShowConnectId: (id: string) => any;
  setShowDestroyId: (id: string) => any;
  setShowUpgradeId: (id: string) => any;
  setShowLogsId: (id: string) => any;
};

export default function DeploymentTable({
  deployments,
  versionMap,
  warning,
  setShowConnectId,
  setShowDestroyId,
  setShowUpgradeId,
  setShowLogsId,
}: DeploymentTableProps) {
  deployments.sort(deploymentOrder);
  const table = (
    <Table warning={warning != null} id="deployments">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell style={{ width: "30%" }}>State</Table.HeaderCell>
          <Table.HeaderCell>Version</Table.HeaderCell>
          <Table.HeaderCell>Hostname</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {deployments.length > 0 ? (
          deployments.map(
            ({
              id,
              name,
              flaggedForDeletion,
              flaggedForUpdate,
              hostname,
              releaseTrack,
              mzVersion,
              statefulsetStatus,
              pendingMigration,
            }: Deployment) => {
              const humanizedDeploymentState = humanizeDeploymentState(
                flaggedForDeletion,
                flaggedForUpdate,
                statefulsetStatus
              );
              return (
                <Table.Row
                  warning={pendingMigration != null}
                  key={id}
                  title={pendingMigration && pendingMigration.description}
                >
                  <Table.Cell>{name}</Table.Cell>
                  <Table.Cell>
                    {humanizedDeploymentState}
                    <Loader
                      active={humanizedDeploymentState !== "Healthy"}
                      inline
                      size="tiny"
                      style={{ marginLeft: "0.5em" }}
                    />
                  </Table.Cell>
                  <Table.Cell>{mzVersion || "unknown"}</Table.Cell>
                  <Table.Cell>{hostname}</Table.Cell>
                  {/* TODO(benesch): avoid hardcoding a width here. */}
                  <Table.Cell style={{ width: "35%" }}>
                    <Button
                      primary
                      onClick={() => setShowConnectId(id)}
                      disabled={statefulsetStatus !== "OK"}
                    >
                      Connect
                    </Button>
                    {mzVersion !== versionMap[releaseTrack] && (
                      <Button
                        basic
                        color="green"
                        onClick={() => setShowUpgradeId(id)}
                      >
                        Upgrade
                      </Button>
                    )}
                    <Button
                      basic
                      color="orange"
                      onClick={() => setShowDestroyId(id)}
                      disabled={false}
                    >
                      Destroy
                    </Button>
                    <Button
                      basic
                      color="blue"
                      onClick={() => setShowLogsId(id)}
                      disabled={false}
                    >
                      Logs
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            }
          )
        ) : (
          <Table.Row>
            <Table.Cell colSpan="4" textAlign="center">
              No deployments yet.
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
  if (warning)
    return (
      <Segment raised>
        <Segment secondary>
          <Header color="red">
            {"Watch out - these instances will shut down on " +
              warning.deadline}
          </Header>
          <p>{warning.description}</p>
        </Segment>
        {table}
      </Segment>
    );
  return table;
}

function humanizeDeploymentState(
  flaggedForDeletion: boolean,
  flaggedForUpdate: boolean,
  statefulsetStatus: string
) {
  if (flaggedForDeletion) {
    return "Destroying";
  }
  if (flaggedForUpdate) {
    return "Updating";
  }
  switch (statefulsetStatus) {
    case "OK":
      return "Healthy";
    case "STARTING":
      return "Starting";
    case "DAMAGED":
      return "Degraded";
    default:
      return "Unknown";
  }
}

// Sorts all deployments with pending migrations first, then sorts by name.
function deploymentOrder(d1: Deployment, d2: Deployment): number {
  return d1.name.localeCompare(d2.name);
}
