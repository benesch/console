# Materialize web console

This is the cloud console interface for Materialize.

## Running the app locally

Ensure you have node 16 and yarn 1.x

```bash
yarn install
yarn proxy
```

### Cloud setup

Clone the [Cloud repo](MaterializeInc/cloud).

```shell
bin/rev-env
# Setup your aws config
bin/mzadmin aws setup
# Setup k8s contexts
bin/mzadmin k8s setup
```

### Deleting regions

If you are running your dev environment against staging, you'll probably need
to delete regions for testing purposes.

From the cloud repo, run:

```bash
# Generate a temporary aws auth token
bin/mzadmin aws login
# Materialize employees can see their org ID in the footer of the console
bin/mzadmin environment delete --cluster staging-us-east-1 --organization $ID
```

## Theming

Materialize Cloud's theme has light and dark mode support! Some of the styling
for this is implicit (based on Chakra's defaults). Other parts were customized
to match Materialize's styles and color scheme. So when styling, make sure that
the styles work with both variants--the Chakra `useColorModeValue` hook will be
your friend. On Mac OS, you can toggle your color mode with System Preferences
\> General.

### Customizing

Chakra's theme docs live
[here](https://chakra-ui.com/docs/theming/customize-theme). There are two
methods by which we can customize our application's look and feel using Chakra:

#### App-wide styles and defaults in `src/theme/`

If your styling should apply to all instances of a built-in Chakra component,
across the board, it's best to modify the Chakra theme. Our custom color
palette is in `theme/colors.ts`, and imported and supplemented in
`theme/index.ts`. Customizations of reusable Chakra components live in
`theme/components.ts`, including setting default variant props. You can crib
off of the existing component styles there, and/or look up the
[sources for Chakra UI's default
theme](https://github.com/chakra-ui/chakra-ui/tree/main/packages/theme/src/components).
The Chakra docs for custom component theming, especially with dark mode in the
mix, are unfortunately not very thorough.

#### Component-specific styling with `useColorMode` and `useColorModeValue`

For one-off styles, especially to components that we built ourselves (that
aren't part of the Chakra system), you can use [Chakra's `useColorMode` and
`useColorModeValue` hooks](https://chakra-ui.com/docs/features/color-mode)
to swap between colors or other styles. `useColorModeValue` is preferred for
singular values (e.g. a single color)--if you need a whole long complicated
string or are switching many different variables, `useColorMode` might make
more sense.

It is preferred to not create a custom component wrapping a Chakra component to
add styles; this should happen in the aforementioned theme file instead.

### Theme testing

On Mac, you can set your color mode in `System Preferences > Settings`. When
you change your color mode, the site will dynamically switch styles. This makes
it pretty easy to check how your new feature works in either style.

## Images

Static images live in `img` and use imports to get added to their
parent component. For SVGs where one wants to customize attributes such as fill
colors, however, importing will not work; in that case the SVG should get added
to `src/svg` as a React component wherein that customization (for
light/dark mode, or for reuse) can happen.

## Code style

As much as possible, we enforce consistent code style via our linter config.
Helpful code editor plugins to this end include ESLint, TSLint (if not subsumed
by ESLint in your editor ecosystem--note that it _is_ part of ESLint in VSCode),
and Prettier. I also recommend Color Highlight if you'll be working with
colors/styling.

However, lint rules don't always cover everything, especially things that are
more of a code smell or a judgment call.

### Component files

At Materialize is acceptable to put multiple components in the same file, when
one is clearly consumed by another (and if, in your judgment, the file is not
too ungainly or complex). However, only one component should be exported from a
file _the vast majority of the time_. That primary component's name should also
be the name of the file. It should also be the default export.

There are exceptions, such as the various pieces of our `<Card>`s, where a
component must be in multiple "lego blocks" that fit together. When this happens
the file name should reflect the fact (e.g. `cardComponents.tsx` rather than
`Card.tsx`).

Don't name components index.tsx (other than the root of the application, of
course).

- This saves us from extraneous folders and
- This makes it easier to tell at a glance which component is which (if the
  title of every tab in your editor is index.tsx, that is really confusing!).

Name the props for your primary exported component `Props` and put it as high in
the file as you can. If for some reason you need to export those props, make the
export under a different name (probably `{COMPONENT_NAME}Props`).

In essence, the goal is that the primary exported component and its `Props` are
the "API" of the file for whatever other components are consuming it. Having a
consistent naming structure makes it just a bit easier to navigate wherever you
are in the code base.
