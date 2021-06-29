import React, { useState } from "react";
import { gql, useQuery, useApolloClient, useMutation } from "@apollo/client";
import { Formik } from "formik";
import type { Deployment } from "./types";
import DeploymentTable from "./DeploymentTable";
import {
  Button,
  Container,
  Dimmer,
  Loader,
  Form,
  Message,
  Modal,
  Accordion,
  Icon,
} from "semantic-ui-react";
import download from "downloadjs";
import { groupBy } from "./util";
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
        orchestratorDeployment {
          id
          status
        }
        pendingMigration {
          id
          deadline
          description
        }
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
  query DownloadCert($deploymentId: String!) {
    downloadCert(deploymentId: $deploymentId)
  }
`;

const CREATE_DEPLOYMENT = gql`
  mutation CreateDeployment($tlsAuthorityId: UUID!) {
    createDeployment(tlsAuthorityId: $tlsAuthorityId) {
      deployment {
        id
      }
    }
  }
`;

const DESTROY_DEPLOYMENT = gql`
  mutation DestroyDeployment($deploymentId: String!) {
    destroyDeployment(deploymentId: $deploymentId) {
      deployment {
        id
      }
    }
  }
`;

const UPGRADE_DEPLOYMENT = gql`
  mutation UpgradeDeployment($deploymentId: String!) {
    upgradeDeployment(deploymentId: $deploymentId) {
      deployment {
        id
      }
    }
  }
`;

const DOWNLOAD_LOGS = gql`
  query DownloadLogs($deploymentId: String!) {
    downloadLogs(deploymentId: $deploymentId)
  }
`;

function Deployments(): JSX.Element {
  const { loading, data, refetch } = useQuery(GET_DEPLOYMENTS, {
    pollInterval: 5000,
  });
  const [createDeployment] = useMutation(CREATE_DEPLOYMENT);
  const [creationError, setCreationError] = useState("");
  const [showConnectId, setShowConnectId] = useState("");
  const [showDestroyId, setShowDestroyId] = useState("");
  const [showUpgradeId, setShowUpgradeId] = useState("");
  const [showLogsId, setShowLogsId] = useState("");

  if (loading)
    return (
      <Container>
        <Dimmer active={loading} inverted>
          <Loader size="large">Loading</Loader>
        </Dimmer>
      </Container>
    );

  const deployments: Deployment[] = data.defaultOrganization.deployments;
  let deploymentsByWarning = groupBy(deployments, (d) => d.pendingMigration);
  if (deploymentsByWarning.size == 0) {
    deploymentsByWarning = new Map([[null, []]]);
  }

  const tlsAuthorities = data.defaultOrganization.tlsAuthorities;
  const canCreateDeployment = data.defaultOrganization.canCreateDeployment;

  return (
    <React.Fragment>
      {showLogsId && (
        <LogsModal
          deployment={deployments.find((d) => d.id == showLogsId) as Deployment}
          close={() => setShowLogsId("")}
        />
      )}
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
            <Form.Button primary disabled={!canCreateDeployment}>
              Create deployment
            </Form.Button>
            <Message error header="Creation failed" content={creationError} />
          </Form>
        )}
      </Formik>
      {!canCreateDeployment && (
        <Message info content="Deployment limit reached." />
      )}
      <React.Fragment>
        {Array.from(deploymentsByWarning).map(([warning, deployments]) => (
          <DeploymentTable
            deployments={deployments}
            latestMzVersion={data.mzVersion}
            warning={warning}
            setShowConnectId={setShowConnectId}
            setShowDestroyId={setShowDestroyId}
            setShowUpgradeId={setShowUpgradeId}
            setShowLogsId={setShowLogsId}
          />
        ))}
      </React.Fragment>
    </React.Fragment>
  );
}

function LogsModal(props: { deployment: Deployment; close: () => void }) {
  const {
    loading,
    error: _,
    data,
    refetch,
  } = useQuery(DOWNLOAD_LOGS, {
    variables: { deploymentId: props.deployment.id },
  });
  return (
    <Modal open={true} size="fullscreen">
      <Modal.Header>
        Logs for <code>{props.deployment.name}</code>
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          {loading ? (
            <Loader size="large">Loading</Loader>
          ) : (
            <pre className="logs">{data.downloadLogs}</pre>
          )}
        </Modal.Description>
        <Modal.Actions>
          <Button onClick={() => props.close()}>Done</Button>
          <Button onClick={() => refetch()}>Refresh</Button>
        </Modal.Actions>
      </Modal.Content>
    </Modal>
  );
}

function ConnectModal(props: { deployment: Deployment; close: () => void }) {
  const [activeAccordion, setAccordion] = useState(0);
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
    download(blob, `${props.deployment.name}-certs.zip`, "application/zip");
  };

  return (
    <Modal open={true}>
      <Modal.Header>Connect to {props.deployment.name}</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Accordion styled>
            <Accordion.Title
              active={activeAccordion === 0}
              index={0}
              onClick={() => setAccordion(0)}
            >
              <Icon name="dropdown" />
              PostgreSQL (psql)
            </Accordion.Title>
            <Accordion.Content active={activeAccordion == 0}>
              <p>
                To connect to this deployment using the{" "}
                <a href="https://www.postgresql.org/docs/13/app-psql.html">
                  psql
                </a>{" "}
                command-line SQL shell:
              </p>
              <ol>
                <li>
                  Install psql, if you don't already have it installed.
                  <br />
                  <ul>
                    <li>
                      On macOS: <code>brew install postgresql</code>
                    </li>
                    <li>
                      On Debian/Ubuntu:{" "}
                      <code>apt install postgresql-client</code>
                    </li>
                  </ul>
                </li>
                <li>
                  Click <b>Download certificates</b>.
                </li>
                <li>Unzip the certificate ZIP file.</li>
                <li>
                  In the same directory as the certificates, run the following
                  command:
                  <p className="connection-string">
                    psql "postgresql://materialize@{props.deployment.hostname}
                    :6875/materialize?sslcert=materialize.crt&amp;sslkey=materialize.key&amp;sslrootcert=ca.crt"
                  </p>
                </li>
              </ol>
            </Accordion.Content>
            <Accordion.Title
              active={activeAccordion === 1}
              index={1}
              onClick={() => setAccordion(1)}
            >
              <Icon name="dropdown" />
              Metabase
            </Accordion.Title>
            <Accordion.Content active={activeAccordion == 1}>
              <p>
                To connect to this deployment using a{" "}
                <a href="https://www.metabase.com/">metabase</a> client:
              </p>
              <ol>
                <li>
                  Ensure metabase runs on your local machine or on a machine you
                  controll. This is necessary to support the certificate-based
                  authentication used by Materialize Cloud. <p /> Follow the{" "}
                  <a href="https://www.metabase.com/docs/latest/operations-guide/installing-metabase.html">
                    official installation instructions
                  </a>{" "}
                  to get metabase set up.
                </li>
                <li>
                  Click <b>Download certificates</b>.
                </li>
                <li>
                  Unzip the certificate ZIP file and ensure the directory is
                  reachable by metabase. Here, we assume they got unpacked to{" "}
                  <span className="connection-string">
                    /Users/you/Downloads/{props.deployment.name}-certs/
                  </span>
                </li>
                <li>
                  In metabase, create a new database:
                  <ul>
                    <li>Select "PostgreSQL" as the type</li>
                    <li>
                      <b>Host</b>:{" "}
                      <span className="connection-string">
                        {props.deployment.hostname}
                      </span>
                    </li>
                    <li>
                      <b>Port</b>:{" "}
                      <span className="connection-string">6875</span>
                    </li>
                    <li>
                      <b>Database name</b>:{" "}
                      <span className="connection-string">materialize</span>
                    </li>
                    <li>
                      <b>Username</b>:{" "}
                      <span className="connection-string">materialize</span>
                    </li>
                    <li>
                      <b>Password</b>: (leave empty)
                    </li>
                    <li>
                      <b>Use a secure connection (SSL)</b>: check to turn on
                    </li>
                    <li>
                      <b>Additional JDBC connection string options</b>:{" "}
                      <span className="connection-string">
                        sslcert=/Users/you/Downloads/{props.deployment.name}
                        -certs/materialize.crt&sslkey=/Users/you/Downloads/
                        {props.deployment.name}
                        -certs/materialize.der.key&sslrootcert=/Users/you/Downloads/
                        {props.deployment.name}-certs/ca.crt&sslmode=verify-full
                      </span>
                      <p>
                        replacing
                        <span className="connection-string">
                          /Users/you/Downloads/{props.deployment.name}
                          -certs
                        </span>{" "}
                        with the location where metabase can reach your
                        certificates.
                      </p>
                    </li>
                  </ul>
                </li>
              </ol>
            </Accordion.Content>
          </Accordion>
          <p>
            If you've just created the deployment, you may need to wait a minute
            or two before you'll be able to connect.
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
      headerText={`Destroy ${props.deployment.name}?`}
      confirmButtonText="Yes, destroy my deployment"
      textConfirmation={props.deployment.name}
      description="This will irreversibly destroy all views and other data for this deployment."
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
      } to ${props.mzVersion}. This will restart materialize.
      All data will be preserved, but clients will need
      to reconnect.`}
      textConfirmation={props.deployment.name}
      onCancel={props.close}
      onConfirm={doUpgrade}
    ></TextConfirmModal>
  );
}

export default Deployments;
