/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-use-before-define */
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

function loadScript(url: string, isExecuted?: () => boolean): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const addedScript = findScript(url);
      if (addedScript && (!isExecuted || isExecuted())) {
        resolve();
        return;
      }

      const scriptElement = addedScript ?? document.createElement('script');

      const done = (): void => {
        scriptElement.removeEventListener('load', onLoad);
        scriptElement.removeEventListener('error', onError);
        if (!addedScript) {
          scriptElement.remove();
        }
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

      if (!addedScript) {
        scriptElement.src = url;
        document.head.appendChild(scriptElement);
      }
    } catch (ex) {
      reject(ex);
    }
  });
}

export type IframeApiVersion = 'latest' | `v2.${number}.${number}` | `2.${number}.${number}`;

function normalizeVersion(version: string): IframeApiVersion {
  if (version === 'latest' || version[0] === 'v') return version as IframeApiVersion;
  return `v${version}` as IframeApiVersion;
}

function compareVersion(
  IframePlayer: Kinescope.IframePlayer,
  version: IframeApiVersion
): IframeApiVersion | undefined {
  const currentVersion = normalizeVersion(IframePlayer.version);
  const isAnotherVersion =
    version === 'latest'
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (IframePlayer as any).isLatestVersion === false
      : version !== currentVersion;
  return isAnotherVersion ? currentVersion : undefined;
}

/**
 * @param version - `latest` or string in format `v2.123.0`. Defaults to `latest`.
 */
export function load(version?: IframeApiVersion): Promise<Kinescope.IframePlayer>;
export function load(url?: URL): Promise<Kinescope.IframePlayer>;

export async function load(
  version: IframeApiVersion | URL = 'latest'
): Promise<Kinescope.IframePlayer> {
  const [normVersion, urlVersion] =
    typeof version === 'string' ? [normalizeVersion(version), undefined] : [undefined, version];

  if (window.Kinescope?.IframePlayer) {
    if (normVersion) {
      const actualVersion = compareVersion(window.Kinescope.IframePlayer, normVersion);
      if (actualVersion) {
        throw new Error(
          `Another version of the IframeApi is already loaded. Requested version: ${normVersion}, loaded version: ${actualVersion}. Only one version of the IframeApi is allowed.`
        );
      }
    }
    return window.Kinescope.IframePlayer;
  }

  const url = urlVersion
    ? urlVersion.toString()
    : `https://player.kinescope.io/${normVersion}/iframe.player.js`;
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
