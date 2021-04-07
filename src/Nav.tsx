import React from "react";
import { Container, Dropdown, Image, Menu } from "semantic-ui-react";
import { Link } from "react-router-dom";

import logo from "./img/logo-symbol-primary.png";
import { useUser } from "./auth/AuthContext";

function Nav() {
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
  };

  // Only render the nav bar if we have logged in
  if (!user) {
    return null;
  }

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
                  Email Support
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown item simple text={user.attributes.email}>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleLogout}>Log out</Dropdown.Item>
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
