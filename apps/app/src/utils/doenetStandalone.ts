/**
 * Optional local override for the DoenetML standalone bundle URL.
 *
 * `<DoenetEditor>` / `<DoenetViewer>` (from `@doenet/doenetml-iframe`) load the
 * ~5 MB `@doenet/standalone` bundle (+ css) from cdn.jsdelivr.net at runtime by
 * default. Under concurrent CI load that cold CDN fetch stalls and leaves the
 * viewer blank, which is the root cause of the flaky e2e tests in issue #2957.
 *
 * When `VITE_DOENET_STANDALONE_URL` (and optionally `VITE_DOENET_STANDALONE_CSS_URL`)
 * is set — e.g. CI downloads the bundle once at setup and serves it from the
 * app's own origin — these are passed as the `standaloneUrl` / `cssUrl` props so
 * the iframe loads the engine locally instead of from the CDN. When unset (the
 * normal dev/prod case) they are `undefined`, so the components keep their CDN
 * default and behavior is unchanged.
 */
export const doenetStandaloneUrl: string | undefined =
  import.meta.env.VITE_DOENET_STANDALONE_URL || undefined;

export const doenetStandaloneCssUrl: string | undefined =
  import.meta.env.VITE_DOENET_STANDALONE_CSS_URL || undefined;
