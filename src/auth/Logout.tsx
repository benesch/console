import React, { useState } from "react";

import { Redirect } from "react-router-dom";

import { useUser } from "./AuthContext";

function Logout() {
  const { logout } = useUser();
  const [done, setDone] = useState(false);
  logout().then(() => setDone(true));
  if (done) {
    return <Redirect to="/login" />;
  }
  return <div>Logging out</div>;
}

export default Logout;
