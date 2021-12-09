export enum AuthSignupEmbedMessages {
  SUCCESS = "EMBED_AUTH_SIGNUP_SUCCESS",
}
export const sendFinishedMessageToParentFrame = () => {
  window.parent.postMessage(AuthSignupEmbedMessages.SUCCESS, "*");
};
