import React from "react";
import { Container, Menu } from "semantic-ui-react";

import Nav from "./Nav";

function LoggedInLayout(props: { children: JSX.Element }) {
  return (
    <React.Fragment>
      <Nav />
      <Container text>{props.children}</Container>
      <Menu fixed="bottom" inverted>
        <Menu.Item>© {new Date().getFullYear()} Materialize</Menu.Item>
      </Menu>
    </React.Fragment>
  );
}

export default LoggedInLayout;
