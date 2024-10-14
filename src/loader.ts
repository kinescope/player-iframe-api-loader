// Just for keep import in output.
import type { Kinescope } from './types';

function isScriptAdded(src: string): boolean {
  const url = src.startsWith('//') ? window.location.protocol + src : src;
  for (let i = 0; i < document.scripts.length; i += 1) {
    if (document.scripts[i].src === url) {
      return true;
    }
  }
  return false;
}

function loadScript(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      if (isScriptAdded(url)) {
        resolve();
        return;
      }

      const scriptElement = document.createElement('script');

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
      scriptElement.src = url;
      document.head.appendChild(scriptElement);
    } catch (ex) {
      reject(ex);
    }
  });
}

export function load(version?: string): Promise<Kinescope.IframePlayer>;
export function load(url: URL): Promise<Kinescope.IframePlayer>;

/**
 * @param version - `latest` or string in format `v2.123.0`. Defaults to `latest`.
 */
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
      ? `https://player.kinescope.io/${version}/iframe.player.js`
      : version.toString();
  await loadScript(url);

  await new Promise<void>((resolve) => {
    const apiReadyHandlers = window.KinescopeIframeApiReadyHandlers ?? [];
    window.KinescopeIframeApiReadyHandlers = apiReadyHandlers;
    apiReadyHandlers.push(resolve);
  });

  if (!window.Kinescope?.IframePlayer)
    throw new Error('Something went wrong. IframeApi is not loaded. See previous log messages.');

  return window.Kinescope.IframePlayer;
}
