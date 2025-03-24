import React from 'react';
import useAsync from '@js-toolkit/react-hooks/useAsync';
import useUpdatedRef from '@js-toolkit/react-hooks/useUpdatedRef';
import { load as loadApi, type IframeApiVersion } from '../loader';

export interface KinescopePlayerProps
  extends React.DetailedHTMLProps<
    React.IframeHTMLAttributes<HTMLIFrameElement>,
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

export default function KinescopePlayer({
  v,
  options,
  onCreate,
  onDestroy,
  onCreateError,
  onDestroyError,
  ...rest
}: KinescopePlayerProps): React.ReactNode {
  const rootRef = React.useRef<HTMLIFrameElement>(null);
  // Options read once only.
  const optionsRef = React.useRef(options);

  // Pass callbacks to auto updatable refs.
  const onCreateRef = useUpdatedRef(onCreate);
  const onDestroyRef = useUpdatedRef(onDestroy);
  const onCreateErrorRef = useUpdatedRef(onCreateError);
  const onDestroyErrorRef = useUpdatedRef(onDestroyError);

  // Stringified error state.
  const [errorContent, setErrorContent] = React.useState<string>();

  // Api loading.
  const [apiState] = useAsync(() => ({
    pending: true,
    action: () => loadApi(v),
  }));

  React.useEffect(
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

      if (!apiState.pending && apiState.error) {
        failed(apiState.error);
        return undefined;
      }

      // If api is not loaded or iframe already removed from the DOM then do nothing.
      if (!apiState.value || !rootRef.current?.parentElement) return undefined;

      const factory = apiState.value;
      const container = rootRef.current;
      let player: Kinescope.IframePlayer.Player;

      // Create player.
      factory
        .create(container, { ...optionsRef.current, keepElement: true })
        .then((pl) => {
          // If unmount was before the `create` is completed.
          if (destroying) return pl.destroy();
          player = pl;
          pl.once(pl.Events.Destroy, () => onDestroyRef.current?.(pl));
          onCreateRef.current?.(pl);
          return undefined;
        })
        .catch(failed);

      // Destroy player on unmount.
      return () => {
        destroying = true;
        if (player) player.destroy().catch(failed);
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
