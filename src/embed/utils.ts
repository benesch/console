/** Checks if the current page is framed on another website */
export const useIsInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};
