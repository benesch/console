import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Grid, Header, Image } from "semantic-ui-react";

import { AuthStatus, useAuth } from "./AuthProvider";
import logo from "../img/logo-symbol-primary.png";

type AuthLayoutProps = {
  children: React.ReactNode;
};

function AuthLayout(props: AuthLayoutProps) {
  const auth = useAuth();

  if (auth.state.status == AuthStatus.LoggedIn) {
    return <Redirect to="/deployments" />;
  }

  return (
    <Grid
      textAlign="center"
      style={{ paddingTop: "10%" }}
      verticalAlign="middle"
    >
      <Grid.Column textAlign="left" style={{ maxWidth: 450 }}>
        <Link to="/">
          <Header
            as="h2"
            color="violet"
            textAlign="center"
            style={{ marginBottom: "1em" }}
          >
            <Image src={logo} /> Materialize Cloud
          </Header>
        </Link>
        {props.children}
      </Grid.Column>
    </Grid>
  );
}

export default AuthLayout;
