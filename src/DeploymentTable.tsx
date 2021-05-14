import React from "react";
import type { Deployment, PendingMigration } from "./types";
import { Button, Header, Segment, Loader, Table } from "semantic-ui-react";

type DeploymentTableProps = {
  deployments: Deployment[];
  latestMzVersion: string;
  warning: PendingMigration;
  setShowConnectId: (id: string) => any;
  setShowDestroyId: (id: string) => any;
  setShowUpgradeId: (id: string) => any;
  setShowLogsId: (id: string) => any;
};

export default function DeploymentTable({
  deployments,
  latestMzVersion,
  warning,
  setShowConnectId,
  setShowDestroyId,
  setShowUpgradeId,
  setShowLogsId,
}: DeploymentTableProps) {
  deployments.sort(deploymentOrder);
  return (
    <Segment raised={warning != null} basic={warning == null}>
      {warning && (
        <Segment secondary>
          <Header color="red">
            {"Watch out - these instances will shut down on " +
              warning.deadline}
          </Header>
          <p>{warning.description}</p>
        </Segment>
      )}
      <Table warning={warning != null}>
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
                state,
                hostname,
                mzVersion,
                orchestratorDeployment,
                pendingMigration,
              }: Deployment) => (
                <Table.Row
                  warning={pendingMigration != null}
                  key={id}
                  title={pendingMigration && pendingMigration.description}
                >
                  <Table.Cell>{name}</Table.Cell>
                  <Table.Cell>
                    {humanizeDeploymentState(
                      state,
                      orchestratorDeployment.status
                    )}
                    <Loader
                      active={!["R", "E"].includes(state)}
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
                      disabled={state !== "R"}
                    >
                      Connect
                    </Button>
                    {state === "R" && mzVersion !== latestMzVersion && (
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
                      disabled={state !== "R"}
                    >
                      Destroy
                    </Button>
                    <Button
                      basic
                      color="blue"
                      onClick={() => setShowLogsId(id)}
                      disabled={["D", "E"].includes(state)}
                    >
                      Logs
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )
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
    </Segment>
  );
}

function humanizeDeploymentState(
  deploymentState: string,
  orchestrationState: string
) {
  switch (deploymentState) {
    case "DQ":
      return "Destroy queued";
    case "D":
      return "Destroying";
    case "E":
      return "Error";
    case "R":
      switch (orchestrationState) {
        case "OK":
          return "Healthy";
        case "STARTING":
          return "Starting";
        case "DAMAGED":
          return "Damaged";
      }
      return "Ready";
    case "Q":
      return "Update queued";
    case "U":
      return "Updating";
    default:
      return "Unknown";
  }
}

// Sorts all deployments with pending migrations first, then sorts by name.
function deploymentOrder(d1: Deployment, d2: Deployment): number {
  return d1.name.localeCompare(d2.name);
}
