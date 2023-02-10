import {
  useApiTokensActions,
  useApiTokensState,
  useAuth,
} from "@frontegg/react";
import React from "react";

export const NEW_USER_DEFAULT_PASSWORD_NAME = "App password";

const useAppPasswords = () => {
  const { user } = useAuth();
  const { loadUserApiTokens, addUserApiToken, resetApiTokensState } =
    useApiTokensActions();
  const tokensState = useApiTokensState();
  const loadingInProgress = tokensState.loaders.LOAD_API_TOKENS;
  const createInProgress = tokensState.loaders.ADD_API_TOKEN;

  React.useEffect(() => {
    loadUserApiTokens();
  }, [loadUserApiTokens]);

  React.useEffect(() => {
    resetApiTokensState();
    // Reset token state when switching orgs, otherwise we continue to display stale app passwords
  }, [resetApiTokensState, user?.tenantId]);

  React.useEffect(() => {
    if (
      loadingInProgress === false &&
      tokensState.apiTokensDataUser.length === 0
    ) {
      addUserApiToken({ description: NEW_USER_DEFAULT_PASSWORD_NAME });
    }
  }, [tokensState.apiTokensDataUser, loadingInProgress, addUserApiToken]);

  const newPassword = React.useMemo(() => {
    if (createInProgress) {
      return null;
    }
    if (tokensState.successDialog) {
      const { clientId, secret } = tokensState.successDialog;
      if (clientId && secret) {
        const formattedClientId = clientId.replaceAll("-", "");
        const formattedSecret = secret.replaceAll("-", "");
        return `mzp_${formattedClientId}${formattedSecret}`;
      }
    }
    return "";
  }, [createInProgress, tokensState]);

  return {
    addUserApiToken,
    loadingInProgress,
    createInProgress,
    tokensState,
    newPassword,
  };
};

export default useAppPasswords;
