import React, { useState } from "react";
import { Formik } from "formik";
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
import {
  Deployment,
  useDeploymentsCreate,
  useDeploymentsDestroy,
  useDeploymentsList,
  useDeploymentsLogsRetrieve,
  useDeploymentsPartialUpdate,
  useMzVersionsList,
} from "./api";
import { useAuth } from "./auth/AuthProvider";
import useInterval from "react-useinterval";

function Deployments(): JSX.Element {
  const { data: deployments, refetch } = useDeploymentsList({});
  const { data: mzVersions } = useMzVersionsList({});
  const { mutate: createDeployment } = useDeploymentsCreate({});
  const [creationError, setCreationError] = useState("");
  const [showConnectId, setShowConnectId] = useState("");
  const [showDestroyId, setShowDestroyId] = useState("");
  const [showUpgradeId, setShowUpgradeId] = useState("");
  const [showLogsId, setShowLogsId] = useState("");
  useInterval(refetch, 5000);

  if (deployments === null || mzVersions === null) {
    return (
      <Container>
        <Dimmer active={true} inverted>
          <Loader size="large">Loading</Loader>
        </Dimmer>
      </Container>
    );
  }

  const latestMzVersion = mzVersions[mzVersions.length - 1];

  let deploymentsByWarning = groupBy(deployments, (d) => d.pendingMigration);
  if (deploymentsByWarning.size == 0) {
    deploymentsByWarning = new Map([[null, []]]);
  }

  // TODO(benesch): don't hardcode this.
  const canCreateDeployment = deployments.length < 2;

  return (
    <React.Fragment>
      {showLogsId && (
        <LogsModal
          deployment={deployments.find((d) => d.id == showLogsId)!}
          close={() => setShowLogsId("")}
        />
      )}
      {showConnectId && (
        <ConnectModal
          deployment={deployments.find((d) => d.id === showConnectId)!}
          close={() => setShowConnectId("")}
        />
      )}
      {showDestroyId && (
        <DestroyModal
          deployment={deployments.find((d) => d.id === showDestroyId)!}
          close={() => setShowDestroyId("")}
          refetch={refetch}
        />
      )}
      {showUpgradeId && (
        <UpgradeModal
          mzVersion={latestMzVersion}
          deployment={deployments.find((d) => d.id === showUpgradeId)!}
          close={() => setShowUpgradeId("")}
          refetch={refetch}
        />
      )}
      <Formik
        initialValues={{}}
        onSubmit={async () => {
          setCreationError("");
          try {
            await createDeployment({ mzVersion: latestMzVersion });
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
            latestMzVersion={latestMzVersion}
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
  } = useDeploymentsLogsRetrieve({
    id: props.deployment.id,
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
            <pre className="logs">{data}</pre>
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
  const { fetchAuthed } = useAuth();

  const downloadCert = async () => {
    const response = await fetchAuthed(
      `/api/deployments/${props.deployment.id}/certs`
    );
    const blob = await response.blob();
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
  const { mutate: destroyDeployment } = useDeploymentsDestroy({});

  const doDestroy = async () => {
    try {
      await destroyDeployment(props.deployment.id);
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
  const { mutate: updateDeployment } = useDeploymentsPartialUpdate({
    id: props.deployment.id,
  });

  const doUpgrade = async () => {
    try {
      await updateDeployment({
        mzVersion: props.mzVersion,
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
