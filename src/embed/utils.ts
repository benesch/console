/** Checks if the current page is framed on another website */
// eslint-disable-next-line import/prefer-default-export
export const useIsInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};
