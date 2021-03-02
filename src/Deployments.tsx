import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useUser } from "./auth/AuthContext";
import { useFormik } from "formik";
import {
  Button,
  Confirm,
  Container,
  Dimmer,
  Loader,
  Form,
  Message,
  Modal,
  Table,
} from "semantic-ui-react";

const GET_DEPLOYMENTS = gql`
  query GetDeployments {
    defaultOrganization {
      deployments {
        id
        name
        state
        ip
      }
      tlsAuthorities {
        id
        name
      }
    }
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

interface Deployment {
  id: string;
  name: string;
  state: string;
  ip: string;
}

function Deployments() {
  const { user } = useUser();
  const { loading, data } = useQuery(GET_DEPLOYMENTS, {
    variables: { user: user.attributes.sub },
  });
  const [createDeployment] = useMutation(CREATE_DEPLOYMENT);
  const [creationError, setCreationError] = useState("");
  const [showConnectId, setShowConnectId] = useState("");
  const [showDestroyId, setShowDestroyId] = useState("");

  const formik = useFormik({
    initialValues: {
      tlsAuthorityId: "",
    },
    onSubmit: async ({ tlsAuthorityId }, actions) => {
      try {
        await createDeployment({
          variables: { tlsAuthorityId: tlsAuthorityId },
        });
      } catch (e) {
        setCreationError(e.message);
      }
    },
  });

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

  return (
    <React.Fragment>
      <Message color="orange">
        <Message.Header>Heads up!</Message.Header>
        <p>
          The UI does not yet refresh properly. Please reload the page (via F5
          or Cmd+R) after clicking a button. If you pummel "Create deployment"
          ten times, you will get ten deployments.
        </p>
      </Message>
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
        />
      )}
      <Form
        loading={formik.isSubmitting}
        error={Boolean(creationError)}
        onSubmit={() => {
          setTimeout(() => window.location.reload(), 200);
          formik.handleSubmit();
        }}
      >
        <Form.Group>
          <Form.Select
            inline
            name="tlsAuthorityId"
            options={tlsAuthorities.map((c: any) => {
              return {
                key: c.id,
                value: c.id,
                text: c.name,
              };
            })}
            onChange={(e, { value }) => {
              formik.setFieldValue("tlsAuthorityId", value);
            }}
            label="TLS CA"
            placeholder="Choose a CA"
          />

          <Form.Button color="green" disabled={!formik.values.tlsAuthorityId}>
            Create deployment
          </Form.Button>
        </Form.Group>
        <Message error header="Creation failed" content={creationError} />
      </Form>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>State</Table.HeaderCell>
            <Table.HeaderCell>Public IP</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {deployments.map(({ id, name, state, ip }: Deployment) => (
            <Table.Row key={id}>
              <Table.Cell>{name}</Table.Cell>
              <Table.Cell>{humanizeDeploymentState(state)}</Table.Cell>
              <Table.Cell>{ip}</Table.Cell>
              {/* TODO(benesch): avoid hardcoding a width here. */}
              <Table.Cell style={{ width: "35%" }}>
                <Button
                  primary
                  onClick={() => setShowConnectId(id)}
                  disabled={state !== "R"}
                >
                  Connect
                </Button>
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
          ))}
        </Table.Body>
      </Table>
    </React.Fragment>
  );
}

function ConnectModal(props: { deployment: Deployment; close: () => void }) {
  const download = () => {
    // TODO(benesch): remove hack.
    let host = window.location.host;
    if (window.location.hostname === "localhost") {
      host = "localhost:8000";
    }
    window.location.href = `http://${host}/deployment/${props.deployment.id}/download-certs`;
  };

  return (
    <Modal open={true}>
      <Modal.Header>Connect to {props.deployment.name} deployment</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>To connect to this deployment via the psql command-line tool:</p>
          <code>
            psql "postgresql://materialize@{props.deployment.ip}
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
          <Button onClick={() => download()} primary>
            Download certificates
          </Button>
          <Button onClick={() => props.close()}>Done</Button>
        </Modal.Actions>
      </Modal.Actions>
    </Modal>
  );
}

function DestroyModal(props: { deployment: Deployment; close: () => void }) {
  const [destroyDeployment] = useMutation(DESTROY_DEPLOYMENT);

  window.console.log(props);

  const doDestroy = async () => {
    try {
      await destroyDeployment({
        variables: { deploymentId: props.deployment.id },
      });
      props.close();
      window.location.reload();
    } catch (e) {
      // TODO(benesch): do better.
      window.console.log(e.message);
    }
  };

  return (
    <Confirm
      confirmButton={{
        negative: true,
        content: "Yes, destroy my deployment",
      }}
      open={true}
      onCancel={() => props.close()}
      onConfirm={() => doDestroy()}
    ></Confirm>
  );
}

function humanizeDeploymentState(deploymentState: string) {
  switch (deploymentState) {
    case "DQ":
      return "DestroyQueued";
    case "D":
      return "Destroying";
    case "E":
      return "Error";
    case "R":
      return "Ready";
    case "Q":
      return "Queued";
    case "U":
      return "Updating";
    default:
      return "Unknown";
  }
}

export default Deployments;
