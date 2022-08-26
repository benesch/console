import { renderHook } from "@testing-library/react-hooks";

import { mockGlobalConfig } from "../../__mocks__/config";
import { shouldDisplayWhatsNewLink, useWhatsNew } from "./hook";
import {
  getMostRecentReleaseNoteId,
  getReleaseNotesRootURL,
  LAST_RELEASENOTEID_KEY,
} from "./releaseNote";

const baseConfig = { releaseNotesRootURL: "https://materialize.com/eng/blog" };

describe("What's New", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe("release notes", () => {
    test("getReleaseNotesRootURL should return the blog url from the global config", () => {
      mockGlobalConfig(baseConfig);
      const url = getReleaseNotesRootURL();
      expect(url).toBe("https://materialize.com/eng/blog");
    });

    test("getMostRecentReleaseNoteId should return the globally defined release note id", () => {
      mockGlobalConfig({
        ...baseConfig,
        lastReleaseNoteId: "july-2021",
      });
      expect(getMostRecentReleaseNoteId()).toBe("july-2021");
    });
  });

  describe("shouldDisplayWhatsNewLink", () => {
    it("should return false if the globally defined release note id is not defined or is an empty string", () => {
      mockGlobalConfig({
        ...baseConfig,
        lastReleaseNoteId: "",
      });
      expect(shouldDisplayWhatsNewLink()).toBe(false);
    });

    it("should return true if there is no currently saved release note id", () => {
      mockGlobalConfig({
        ...baseConfig,
        lastReleaseNoteId: "july-2020",
      });
      expect(shouldDisplayWhatsNewLink()).toBe(true);
    });

    it("should return true if the new release note id is different from the one saved locally", () => {
      window.localStorage.setItem(LAST_RELEASENOTEID_KEY, "july-2020");
      mockGlobalConfig({
        ...baseConfig,
        lastReleaseNoteId: "july-2021",
      });
      expect(shouldDisplayWhatsNewLink()).toBe(true);
    });
  });

  describe("useWhatsNew hook", () => {
    it("should return a truthy visible prop if we should show the what's new link", () => {
      window.localStorage.setItem(LAST_RELEASENOTEID_KEY, "july-2020");
      mockGlobalConfig({
        ...baseConfig,
        lastReleaseNoteId: "july-2021",
      });
      const hook = renderHook(() => useWhatsNew());
      expect(hook.result.current).toMatchObject({ visible: true });
    });

    it("should return a onLinkClicked prop that update the local cache with the last release note seen", () => {
      window.localStorage.setItem(LAST_RELEASENOTEID_KEY, "july-2020");
      mockGlobalConfig({
        ...baseConfig,
        lastReleaseNoteId: "july-2021",
      });
      const hook = renderHook(() => useWhatsNew());
      hook.result.current.onLinkClicked();
      expect(window.localStorage.getItem(LAST_RELEASENOTEID_KEY)).toBe(
        "july-2021"
      );
    });
  });
});
