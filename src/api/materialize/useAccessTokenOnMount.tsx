import { useState } from "react";

import { useAuth } from "~/api/auth";

/**
 * Since access tokens do not expire in mz's current WebSocket protocol,
 * we can reuse the access token we get on mount.
 */
const useAccessTokenOnMount = () => {
  const { user } = useAuth();
  const [accessTokenOnMount, setAccessTokenOnMount] = useState(
    user?.accessToken
  );

  const { accessToken } = user ?? {};

  if (accessTokenOnMount === undefined && accessToken !== accessTokenOnMount) {
    setAccessTokenOnMount(accessTokenOnMount);
  }

  return { accessTokenOnMount };
};

export default useAccessTokenOnMount;
