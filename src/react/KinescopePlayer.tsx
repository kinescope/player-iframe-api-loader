/// <reference path="../types/global.d.ts" preserve="true" />
import {
  useEffect,
  useRef,
  useState,
  type DetailedHTMLProps,
  type IframeHTMLAttributes,
  type ReactNode,
} from 'react';
import { useAsync } from '@js-toolkit/react-hooks/useAsync';
import { useUpdatedRef } from '@js-toolkit/react-hooks/useUpdatedRef';
import { load as loadApi, type IframeApiVersion } from '../loader.js';

export interface KinescopePlayerProps extends DetailedHTMLProps<
  IframeHTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
> {
  /** Iframe Api version. Defaults to `latest`. Usually you don't want to set this parameter. */
  readonly v?: IframeApiVersion;
  /** Options read once only. */
  readonly options: Kinescope.IframePlayer.CreateOptions;
  /** It is not necessary to be a stable ref callback. */
  readonly onCreate?: (player: Kinescope.IframePlayer.Player) => void;
  /** It is not necessary to be a stable ref callback. */
  readonly onDestroy?: (player: Kinescope.IframePlayer.Player) => void;
  /** It is not necessary to be a stable ref callback. */
  readonly onCreateError?: (error: unknown) => void;
  /** It is not necessary to be a stable ref callback. */
  readonly onDestroyError?: (error: unknown) => void;
}

/**
 * The last create or destroy of a player in each iframe. Each create waits for it, because:
 * - `create()` cannot be aborted, so an effect re-run while it is pending (e.g. in `<Activity>`)
 *   would start a second create in the same iframe;
 * - a player destroyed with `keepElement` only removes the iframe `src`, and the old embed
 *   document keeps answering the handshake until a new document replaces it, so a new player
 *   would connect to the old document and stop responding once it unloads.
 */
const iframeQueue = new WeakMap<HTMLIFrameElement, Promise<unknown>>();

const UNLOAD_TIMEOUT = 3000;

/** Replaces the embed document left after `destroy` with `about:blank`. Never rejects. */
function unloadIframe(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve) => {
    const listeners = new AbortController();
    listeners.signal.addEventListener('abort', () => resolve());
    const timer = setTimeout(() => listeners.abort(), UNLOAD_TIMEOUT);
    iframe.addEventListener(
      'load',
      () => {
        clearTimeout(timer);
        listeners.abort();
      },
      { signal: listeners.signal }
    );
    iframe.src = 'about:blank';
  });
}

async function destroyPlayer(
  player: Kinescope.IframePlayer.Player,
  iframe: HTMLIFrameElement
): Promise<void> {
  try {
    await player.destroy();
  } finally {
    await unloadIframe(iframe);
  }
}

export default function KinescopePlayer({
  v,
  options,
  onCreate,
  onDestroy,
  onCreateError,
  onDestroyError,
  ...rest
}: KinescopePlayerProps): ReactNode {
  const rootRef = useRef<HTMLIFrameElement>(null);
  // Options read once only.
  const optionsRef = useRef(options);

  // Pass callbacks to auto updatable refs.
  const onCreateRef = useUpdatedRef(onCreate);
  const onDestroyRef = useUpdatedRef(onDestroy);
  const onCreateErrorRef = useUpdatedRef(onCreateError);
  const onDestroyErrorRef = useUpdatedRef(onDestroyError);

  // Stringified error state.
  const [errorContent, setErrorContent] = useState<string>();

  // Api loading.
  const [apiState] = useAsync(() => ({
    pending: true,
    action: () => loadApi(v),
  }));

  useEffect(
    () => {
      let destroying = false;

      const failed = (error: unknown): void => {
        // Do not update state and call callbacks when unmount.
        if (destroying) {
          if (onDestroyErrorRef.current) onDestroyErrorRef.current(error);
          else console.warn(error);
          return;
        }
        if (onCreateErrorRef.current) onCreateErrorRef.current(error);
        else setErrorContent(String(error));
      };

      if (!apiState.pending && apiState.error !== undefined) {
        failed(apiState.error);
        return undefined;
      }

      // If api is not loaded or iframe already removed from the DOM then do nothing.
      if (!apiState.value || !rootRef.current?.parentElement) return undefined;

      const factory = apiState.value;
      const container = rootRef.current;
      let player: Kinescope.IframePlayer.Player | undefined;

      // Create player after the previous one in this iframe is created or destroyed.
      const created = (iframeQueue.get(container) ?? Promise.resolve())
        .catch(() => undefined)
        .then(() =>
          destroying
            ? undefined
            : factory.create(container, { ...optionsRef.current, keepElement: true })
        )
        .then((pl) => {
          if (!pl) return undefined;
          // If unmount was before the `create` is completed.
          if (destroying) return destroyPlayer(pl, container);
          player = pl;
          pl.once(pl.Events.Destroy, () => onDestroyRef.current?.(pl));
          onCreateRef.current?.(pl);
          return undefined;
        })
        .catch(failed);
      iframeQueue.set(container, created);

      // Destroy player on unmount.
      return () => {
        destroying = true;
        if (player) iframeQueue.set(container, destroyPlayer(player, container).catch(failed));
      };
    },
    // Execute effect when api loaded or failed.
    [
      apiState.error,
      apiState.pending,
      apiState.value,
      onCreateErrorRef,
      onCreateRef,
      onDestroyErrorRef,
      onDestroyRef,
    ]
  );

  return <iframe ref={rootRef} srcDoc={errorContent} {...rest} />;
}
