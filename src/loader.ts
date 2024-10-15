// Just for keep import in output.
import type { Kinescope } from './types';

function findScript(src: string): HTMLScriptElement | undefined {
  const url = src.startsWith('//') ? window.location.protocol + src : src;
  for (let i = 0; i < document.scripts.length; i += 1) {
    if (document.scripts[i].src === url) {
      return document.scripts[i];
    }
  }
  return undefined;
}

function loadScript(url: string, testExecuted?: () => boolean): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const scriptAdded = findScript(url);
      if (scriptAdded && (!testExecuted || testExecuted())) {
        resolve();
        return;
      }

      const scriptElement = scriptAdded ?? document.createElement('script');

      const done = (): void => {
        scriptElement.removeEventListener('load', onLoad);
        scriptElement.removeEventListener('error', onError);
        scriptElement.remove();
      };

      const onLoad = (): void => {
        done();
        resolve();
      };

      const onError = (error: Event): void => {
        done();
        const ex =
          error instanceof ErrorEvent
            ? error
            : new Error(`Unable to load script by url ${url}.`, { cause: error });
        reject(ex);
      };

      scriptElement.addEventListener('load', onLoad, { once: true });
      scriptElement.addEventListener('error', onError, { once: true });

      if (!scriptAdded) {
        scriptElement.src = url;
        document.head.appendChild(scriptElement);
      }
    } catch (ex) {
      reject(ex);
    }
  });
}

/**
 * @param version - `latest` or string in format `v2.123.0`. Defaults to `latest`.
 */
export function load(version?: string): Promise<Kinescope.IframePlayer>;
export function load(url: URL): Promise<Kinescope.IframePlayer>;

export async function load(version: string | URL = 'latest'): Promise<Kinescope.IframePlayer> {
  if (window.Kinescope?.IframePlayer) {
    if (typeof version === 'string') {
      const prevVersion = window.Kinescope.IframePlayer.version;
      const isAnotherVersion =
        version === 'latest'
          ? (window.Kinescope.IframePlayer as any).isLatestVersion === false
          : version !== prevVersion;
      if (isAnotherVersion) {
        throw new Error(
          `Another version of the IframeApi is already loaded. Requested version: ${version}, loaded version: ${prevVersion}. Only one version of the IframeApi is allowed.`
        );
      }
    }
    return window.Kinescope.IframePlayer;
  }

  const url =
    typeof version === 'string'
      ? `https://player.kinescope.io/${version[0] === 'v' ? version : `v${version}`}/iframe.player.js`
      : version.toString();
  await loadScript(url, () => !!window.Kinescope?.IframePlayer);

  await new Promise<void>((resolve) => {
    const apiReadyHandlers = window.KinescopeIframeApiReadyHandlers ?? [];
    window.KinescopeIframeApiReadyHandlers = apiReadyHandlers;
    apiReadyHandlers.push(resolve);
  });

  if (!window.Kinescope?.IframePlayer)
    throw new Error('Something went wrong. IframeApi is not loaded. See previous log messages.');

  return window.Kinescope.IframePlayer;
}
