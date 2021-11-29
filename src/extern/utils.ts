export const useIsInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};
