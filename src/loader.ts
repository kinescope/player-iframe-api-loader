/// <reference path="./types/global.d.ts" preserve="true" />

export type IframeApiVersion = 'latest' | `v2.${number}.${number}` | `2.${number}.${number}`;

export interface LoadOptions {
  /**
   * How long one attempt to load the script may take, in milliseconds. Defaults to `15000`.
   * `0` disables the limit.
   */
  readonly timeout?: number | undefined;
  /** How many times to retry after a failed attempt. Defaults to `2`. */
  readonly retries?: number | undefined;
  /** Pause between attempts, in milliseconds. Defaults to `1000`. */
  readonly retryDelay?: number | undefined;
}

const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1_000;

/** One loading shared by all `load()` calls made while it is in progress. */
let pending: Promise<Kinescope.IframePlayer> | undefined;

function getFactory(): Kinescope.IframePlayer | undefined {
  return window.Kinescope?.IframePlayer;
}

function findScript(url: string): HTMLScriptElement | undefined {
  return Array.from(document.scripts).find((script) => script.src === url);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Resolves on `load`, rejects on `error` or timeout.
 * A script that has already finished (loaded or failed) fires no more events,
 * so only the timeout can end the wait in that case.
 */
function waitForScript(script: HTMLScriptElement, timeout: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const listeners = new AbortController();
    const timer =
      timeout > 0
        ? setTimeout(() => {
            listeners.abort();
            reject(new Error(`Loading of script ${script.src} timed out after ${timeout} ms.`));
          }, timeout)
        : undefined;

    const settle = (error?: Error): void => {
      listeners.abort();
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    };

    script.addEventListener('load', () => settle(), { signal: listeners.signal });
    script.addEventListener(
      'error',
      () => settle(new Error(`Unable to load script ${script.src}.`)),
      { signal: listeners.signal }
    );
  });
}

/**
 * The player script initializes the API synchronously while it executes,
 * so the API must be there by the time the `load` event fires.
 */
async function loadOnce(url: string, timeout: number): Promise<Kinescope.IframePlayer> {
  const loaded = getFactory();
  if (loaded) return loaded;

  // A tag with the same url added by someone else may still be loading, but it may also have failed.
  const existing = findScript(url);
  if (existing) {
    try {
      await waitForScript(existing, timeout);
    } catch {
      // Replaced by a new tag below.
    }
    const factory = getFactory();
    if (factory) return factory;
    existing.remove();
  }

  const script = document.createElement('script');
  script.src = url;
  script.async = true;
  const loading = waitForScript(script, timeout);
  document.head.appendChild(script);
  try {
    await loading;
  } finally {
    script.remove();
  }

  const factory = getFactory();
  if (!factory) {
    throw new Error(
      `Script ${url} is loaded, but the IframePlayer API is not initialized. See previous errors in the console.`
    );
  }
  return factory;
}

async function loadWithRetries(
  url: string,
  {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
  }: LoadOptions
): Promise<Kinescope.IframePlayer> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await loadOnce(url, timeout);
    } catch (error) {
      if (attempt >= retries) {
        throw new Error(
          `Unable to load the IframePlayer API from ${url} (attempts: ${attempt + 1}).`,
          { cause: error }
        );
      }
    }
    // eslint-disable-next-line no-await-in-loop
    await delay(retryDelay);
  }
}

function loadShared(url: string, options: LoadOptions): Promise<Kinescope.IframePlayer> {
  if (!pending) {
    const current = loadWithRetries(url, options).then(
      (factory) => {
        if (pending === current) pending = undefined;
        return factory;
      },
      (error: unknown) => {
        // Let the next call start over.
        if (pending === current) pending = undefined;
        throw error;
      }
    );
    pending = current;
  }
  return pending;
}

function normalizeVersion(version: string): IframeApiVersion {
  if (version === 'latest' || version.startsWith('v')) return version as IframeApiVersion;
  return `v${version}` as IframeApiVersion;
}

function getScriptUrl(version: IframeApiVersion | URL): string {
  if (typeof version !== 'string') return version.toString();
  return `https://player.kinescope.io/${normalizeVersion(version)}/iframe.player.js`;
}

function assertVersion(factory: Kinescope.IframePlayer, version: IframeApiVersion): void {
  const requested = normalizeVersion(version);
  const loaded = normalizeVersion(factory.version);
  const isAnotherVersion =
    requested === 'latest'
      ? (factory as { readonly isLatestVersion?: boolean }).isLatestVersion === false
      : requested !== loaded;
  if (isAnotherVersion) {
    throw new Error(
      `Another version of the IframeApi is already loaded. Requested version: ${requested}, loaded version: ${loaded}. Only one version of the IframeApi is allowed.`
    );
  }
}

/**
 * Loads the IFrame API script once and returns the player factory.
 *
 * Calls made while the script is loading share one loading. A failed attempt is retried
 * (see {@link LoadOptions}); after all attempts fail the promise rejects and the next call
 * starts over.
 *
 * @param version - `latest`, a version in format `v2.123.0`, or the script url. Defaults to `latest`.
 * Only one version of the API can be loaded on a page: requesting another version rejects.
 * @param options - Timeout and retries. Used only by the call that starts loading.
 */
export async function load(
  version: IframeApiVersion | URL = 'latest',
  options: LoadOptions = {}
): Promise<Kinescope.IframePlayer> {
  const factory = getFactory() ?? (await loadShared(getScriptUrl(version), options));
  if (typeof version === 'string') assertVersion(factory, version);
  return factory;
}
