/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-use-before-define */
import './types';
   
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

/**
 * @param version - `latest` or string in format `v2.123.0`. Defaults to `latest`.
 */
export async function load(version = 'latest'): Promise<typeof Kinescope.IframePlayer> {
  if (window.Kinescope?.IframePlayer) return window.Kinescope.IframePlayer;
  await loadScript(`https://player.kinescope.io/${version}/iframe.player.js`);
  if (!window.Kinescope?.IframePlayer)
    throw new Error('Something went wrong. IframeApi is not loaded. See previous log messages.');
  return window.Kinescope.IframePlayer;
}
