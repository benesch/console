import React from "react";
import { Container, Dropdown, Image, Menu } from "semantic-ui-react";
import { Link } from "react-router-dom";

import logo from "./img/logo-symbol-primary.png";
import { AuthStatus, useAuth } from "./auth/AuthProvider";
import { assert } from "./util";

function Nav() {
  const auth = useAuth();

  // The `Nav` component is only rendered for logged-in users.
  assert(auth.state.status == AuthStatus.LoggedIn);

  return (
    <React.Fragment>
      <Menu fixed="top" inverted>
        <Container>
          <Menu.Item as="a" header>
            <Image size="mini" src={logo} style={{ marginRight: "1em" }} />
            Materialize Cloud
          </Menu.Item>
          <Menu.Item>
            <Link to="/deployments">Deployments</Link>
          </Menu.Item>

          <Menu.Menu position="right">
            <Dropdown item simple text="Support">
              <Dropdown.Menu>
                <Dropdown.Item
                  as="a"
                  target="_blank"
                  href="https://materialize.com/docs/cloud/"
                >
                  Documentation
                </Dropdown.Item>
                <Dropdown.Item
                  as="a"
                  target="_blank"
                  href="https://materialize.com/s/chat"
                >
                  Join us on Slack
                </Dropdown.Item>
                <Dropdown.Item
                  as="a"
                  target="_blank"
                  href="mailto:support@materialize.com"
                >
                  Email us
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown item simple text={auth.state.user.attributes.email}>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => auth.logout()}>
                  Log out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
        </Container>
      </Menu>
      <div style={{ height: "7em" }}></div>
    </React.Fragment>
  );
}

export default Nav;
