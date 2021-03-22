import React, { useState } from "react";
import { gql, useQuery, useApolloClient, useMutation } from "@apollo/client";
import { Formik } from "formik";
import {
  Button,
  Container,
  Dimmer,
  Loader,
  Form,
  Message,
  Modal,
  Table,
} from "semantic-ui-react";
import download from "downloadjs";
import { TextConfirmModal } from "./components";

const GET_DEPLOYMENTS = gql`
  query GetDeployments {
    defaultOrganization {
      deployments {
        id
        name
        state
        hostname
        mzVersion
      }
      tlsAuthorities {
        id
        name
      }
      canCreateDeployment
    }
    mzVersion
  }
`;

const DOWNLOAD_CERT = gql`
  query DownloadCert($deploymentId: UUID!) {
    downloadCert(deploymentId: $deploymentId)
  }
`;

const CREATE_DEPLOYMENT = gql`
  mutation($tlsAuthorityId: UUID!) {
    createDeployment(tlsAuthorityId: $tlsAuthorityId) {
      deployment {
        id
      }
    }
  }
`;

const DESTROY_DEPLOYMENT = gql`
  mutation($deploymentId: UUID!) {
    destroyDeployment(deploymentId: $deploymentId) {
      deployment {
        id
      }
    }
  }
`;

const UPGRADE_DEPLOYMENT = gql`
  mutation($deploymentId: UUID!) {
    upgradeDeployment(deploymentId: $deploymentId) {
      deployment {
        id
      }
    }
  }
`;

interface Deployment {
  id: string;
  name: string;
  state: string;
  hostname: string;
  mzVersion: string;
}

function Deployments() {
  const { loading, data, refetch } = useQuery(GET_DEPLOYMENTS, {
    pollInterval: 5000,
  });
  const [createDeployment] = useMutation(CREATE_DEPLOYMENT);
  const [creationError, setCreationError] = useState("");
  const [showConnectId, setShowConnectId] = useState("");
  const [showDestroyId, setShowDestroyId] = useState("");
  const [showUpgradeId, setShowUpgradeId] = useState("");

  if (loading)
    return (
      <Container>
        <Dimmer active={loading} inverted>
          <Loader size="large">Loading</Loader>
        </Dimmer>
      </Container>
    );

  const deployments: Array<Deployment> = data.defaultOrganization.deployments;
  const tlsAuthorities = data.defaultOrganization.tlsAuthorities;
  const canCreateDeployment = data.defaultOrganization.canCreateDeployment;

  return (
    <React.Fragment>
      {showConnectId && (
        <ConnectModal
          deployment={
            deployments.find((d) => d.id === showConnectId) as Deployment
          }
          close={() => setShowConnectId("")}
        />
      )}
      {showDestroyId && (
        <DestroyModal
          deployment={
            deployments.find((d) => d.id === showDestroyId) as Deployment
          }
          close={() => setShowDestroyId("")}
          refetch={refetch}
        />
      )}
      {showUpgradeId && (
        <UpgradeModal
          mzVersion={data.mzVersion}
          deployment={
            deployments.find((d) => d.id === showUpgradeId) as Deployment
          }
          close={() => setShowUpgradeId("")}
          refetch={refetch}
        />
      )}
      <Formik
        initialValues={{
          tlsAuthorityId:
            tlsAuthorities.length === 1 ? tlsAuthorities[0].id : "",
        }}
        onSubmit={async ({ tlsAuthorityId }) => {
          setCreationError("");
          try {
            await createDeployment({
              variables: { tlsAuthorityId: tlsAuthorityId },
            });
            refetch();
          } catch (e) {
            setCreationError(e.message);
          }
        }}
      >
        {(formik) => (
          <Form
            loading={formik.isSubmitting}
            error={Boolean(creationError)}
            onSubmit={() => {
              formik.handleSubmit();
            }}
          >
            <Form.Group>
              <Form.Select
                inline
                name="tlsAuthorityId"
                value={formik.values["tlsAuthorityId"]}
                options={tlsAuthorities.map((c: any) => {
                  return {
                    value: c.id,
                    text: c.name,
                  };
                })}
                onChange={(_e, { value }) => {
                  formik.setFieldValue("tlsAuthorityId", value);
                }}
                label="TLS CA"
                placeholder="Choose a CA"
              />

              <Form.Button
                color="green"
                disabled={!formik.values.tlsAuthorityId || !canCreateDeployment}
              >
                Create deployment
              </Form.Button>
            </Form.Group>
            <Message error header="Creation failed" content={creationError} />
          </Form>
        )}
      </Formik>
      {!canCreateDeployment && (
        <Message info content="Deployment limit reached." />
      )}
      <Table>
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
          {deployments.map(
            ({ id, name, state, hostname, mzVersion }: Deployment) => (
              <Table.Row key={id}>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>
                  {humanizeDeploymentState(state)}
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
                  {state === "R" && mzVersion !== data.mzVersion && (
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
                    color="red"
                    onClick={() => setShowDestroyId(id)}
                    disabled={state !== "R"}
                  >
                    Destroy
                  </Button>
                </Table.Cell>
              </Table.Row>
            )
          )}
        </Table.Body>
      </Table>
    </React.Fragment>
  );
}

function ConnectModal(props: { deployment: Deployment; close: () => void }) {
  const apolloClient = useApolloClient();

  const downloadCert = async () => {
    const data = await apolloClient.query({
      query: DOWNLOAD_CERT,
      variables: { deploymentId: props.deployment.id },
    });
    const certData = Uint8Array.from(atob(data.data.downloadCert), (c) =>
      c.charCodeAt(0)
    );
    const blob = new Blob([certData]);
    download(blob, "materialize-cert.zip", "application/zip");
  };

  return (
    <Modal open={true}>
      <Modal.Header>Connect to {props.deployment.name} deployment</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>To connect to this deployment via the psql command-line tool:</p>
          <code>
            psql "postgresql://materialize@{props.deployment.hostname}
            :6875/materialize?sslcert=materialize.crt&amp;sslkey=materialize.key&amp;sslrootcert=ca.crt"
          </code>
          <p>
            Run this command from the directory in which you have downloaded the
            certificates below.
          </p>
          <p>
            If your instance booted recently, it may take another minute or two
            before the psql connection will succeed.
          </p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Modal.Actions>
          <Button onClick={downloadCert} primary>
            Download certificates
          </Button>
          <Button onClick={() => props.close()}>Done</Button>
        </Modal.Actions>
      </Modal.Actions>
    </Modal>
  );
}

function DestroyModal(props: {
  deployment: Deployment;
  close: () => void;
  refetch: () => void;
}) {
  const [destroyDeployment] = useMutation(DESTROY_DEPLOYMENT);

  const doDestroy = async () => {
    try {
      await destroyDeployment({
        variables: { deploymentId: props.deployment.id },
      });
      props.refetch();
      props.close();
    } catch (e) {
      // TODO(benesch): do better.
      window.console.log(e.message);
    }
  };

  return (
    <TextConfirmModal
      confirmButtonText="Yes, destroy my deployment"
      textConfirmation={props.deployment.name}
      onCancel={props.close}
      onConfirm={doDestroy}
    ></TextConfirmModal>
  );
}

function UpgradeModal(props: {
  mzVersion: string;
  deployment: Deployment;
  close: () => void;
  refetch: () => void;
}) {
  const [upgradeDeployment] = useMutation(UPGRADE_DEPLOYMENT);

  const doUpgrade = async () => {
    try {
      await upgradeDeployment({
        variables: { deploymentId: props.deployment.id },
      });
      props.refetch();
      props.close();
    } catch (e) {
      // TODO(benesch): do better.
      window.console.log(e.message);
    }
  };

  return (
    <TextConfirmModal
      confirmButtonText="Yes, upgrade and restart"
      description={`Upgrade from ${
        props.deployment.mzVersion || "an unknown version"
      } to ${props.mzVersion}. This will restart materialize.`}
      textConfirmation={props.deployment.name}
      onCancel={props.close}
      onConfirm={doUpgrade}
    ></TextConfirmModal>
  );
}

function humanizeDeploymentState(deploymentState: string) {
  switch (deploymentState) {
    case "DQ":
      return "Destroy queued";
    case "D":
      return "Destroying";
    case "E":
      return "Error";
    case "R":
      return "Ready";
    case "Q":
      return "Update queued";
    case "U":
      return "Updating";
    default:
      return "Unknown";
  }
}

export default Deployments;
