import React from "react";
import { Container, Dropdown, Image, Menu } from "semantic-ui-react";
import { Link, useHistory } from "react-router-dom";

import logo from "./img/logo-symbol-primary.png";
import { AdminPortal, useAuth } from "@frontegg/react";

function Nav() {
  const history = useHistory();
  const { user, routes: authRoutes } = useAuth();
  return (
    <React.Fragment>
      <Menu fixed="top" inverted>
        <Container>
          <Menu.Item as="a" header>
            <Image size="mini" src={logo} style={{ marginRight: "1em" }} />
            Materialize Cloud
          </Menu.Item>
          <Menu.Item>
            <Link to="/">Deployments</Link>
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
            <Dropdown item simple text={user.email}>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => AdminPortal.show()}>
                  Admin portal
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => history.push(authRoutes.logoutUrl)}
                >
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
