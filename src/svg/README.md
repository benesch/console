Folder for SVGs that have dynamic elements based on props or Chakra theme, and thus must be treated as React components.

This is hacky but necessary because regular file imports of svg files turn them into static assets, on which things like fill color cannot be set manually, even with CSS.
