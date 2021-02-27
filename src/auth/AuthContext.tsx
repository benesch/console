import React from "react";
import { Auth } from "aws-amplify";
import { CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js";

export type UserChallenge =
  | "CUSTOM_CHALLENGE"
  | "NEW_PASSWORD_REQUIRED"
  | "SMS_MFA"
  | "SOFTWARE_TOKEN_MFA"
  | "MFA_SETUP"
  | undefined;

export interface ISignInResult extends CognitoUser {
  challengeName: UserChallenge;
}

export interface ISignUpResult {
  user: CognitoUser;
  userConfirmed: boolean;
  userSub: string;
}

type ContextType = {
  user: any | null;
  inContext: boolean;
  hasInitialized: boolean;
  getSession: () => Promise<CognitoUserSession>;
  login: (email: string, password: string) => Promise<ISignInResult | null>;
  signUp: (email: string, password: string) => Promise<ISignUpResult | null>;
  logout: () => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  forgotPasswordSubmit: (
    email: string,
    code: string,
    password: string
  ) => Promise<any>;
  newPassword: (password: string) => Promise<any>;
  confirmSignUp: (email: string, code: string) => Promise<any>;
  resendSignUp: (email: string) => Promise<string>;
};

export const UserContext = React.createContext<ContextType>({
  user: null,
  inContext: false,
  hasInitialized: false,
  getSession: () => Promise.reject(null),
  login: (email: string, password: string) => Promise.resolve(null),
  signUp: (email: string, password: string) => Promise.resolve(null),
  logout: () => Promise.resolve(null),
  forgotPassword: (password: string) => Promise.resolve(null),
  forgotPasswordSubmit: (email: string, code: string, password: string) =>
    Promise.resolve(null),
  newPassword: (password: string) => Promise.resolve(null),
  confirmSignUp: (email: string, code: string) => Promise.resolve(null),
  resendSignUp: (email: string) => Promise.reject(null),
});

type UserProviderOptions = {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  children: React.ReactNode;
};

export function UserProvider({
  region,
  userPoolId,
  userPoolWebClientId,
  children,
}: UserProviderOptions) {
  const [user, setUser] = React.useState(null);
  const [hasInitialized, setHasInitialized] = React.useState(false);

  React.useEffect(() => {
    Auth.configure({
      region,
      userPoolId,
      userPoolWebClientId,
    });

    // attempt to fetch the info of the user that was already logged in
    Auth.currentAuthenticatedUser()
      .then((user) => setUser(user))
      .catch((e: Error) => {
        //TODO: Is this needed?
        //console.log(`Error getting current user: ${e}`);
        //setUser(null)
      })
      .finally(() => setHasInitialized(true));
  }, [region, userPoolId, userPoolWebClientId]);

  function getSession(): Promise<CognitoUserSession> {
    return Auth.userSession(user);
  }

  function login(
    email: string,
    password: string
  ): Promise<ISignInResult | null> {
    return Auth.signIn(email, password).then((cognitoUser) => {
      setUser(cognitoUser);
      return cognitoUser;
    });
  }

  function logout(): Promise<any> {
    return Auth.signOut().then((data) => {
      setUser(null);
      return data;
    });
  }

  function forgotPassword(email: string): Promise<any> {
    return Auth.forgotPassword(email);
  }

  function forgotPasswordSubmit(
    email: string,
    code: string,
    password: string
  ): Promise<any> {
    return Auth.forgotPasswordSubmit(email, code, password);
  }

  function newPassword(password: string): Promise<any> {
    if (user != null) {
      return Auth.completeNewPassword(user, password);
    }
    return Promise.reject(null);
  }

  function signUp(email: string, password: string): Promise<any> {
    if (!user) {
      const result = Auth.signUp({
        username: email,
        password: password,
      });
      return result;
    }
    return Promise.reject(null);
  }

  async function confirmSignUp(email: string, code: string): Promise<any> {
    if (!user) {
      const result = await Auth.confirmSignUp(email, code);
      Auth.currentAuthenticatedUser().then((user) => console.log(user));
      return result;
    }
    return Promise.reject(null);
  }

  async function resendSignUp(email: string): Promise<string> {
    if (!user) {
      const result = await Auth.resendSignUp(email);
      return result;
    }
    return Promise.reject(null);
  }

  const userMemo = React.useMemo(() => user, [user]);

  return (
    <UserContext.Provider
      value={{
        user: userMemo,
        inContext: true,
        hasInitialized,
        getSession,
        login,
        logout,
        forgotPassword,
        forgotPasswordSubmit,
        newPassword,
        signUp,
        confirmSignUp,
        resendSignUp,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context.inContext) {
    throw new Error(
      "`useUser` hook must be used within a `UserProvider` component"
    );
  }
  return context;
};
