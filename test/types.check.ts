// Compile-time checks of the public types, run by `npm run typecheck`.
/// <reference path="../src/types/global.d.ts" />

type CreateOptions = Kinescope.IframePlayer.CreateOptions;
type Player = Kinescope.IframePlayer.Player;

export const options: CreateOptions = {
  url: new URL('https://kinescope.io/embed/123'),
  playerId: 'player',
  timeout: 30_000,
  attemptTimeout: 15_000,
  errorScreen: false,
  origin: 'https://example.com',
  behavior: {
    autoPlay: 'hover',
    playback: 'normal',
    keyboard: { seek: false },
    localStorage: { time: { min: 10, scope: 'item' }, volume: false, storage: 'session' },
    textTrack: { variant: 'classic' },
    playbackRate: 1.5,
    volume: 0.5,
    playlist: { initialItem: [0, 1] },
  },
  ui: {
    language: 'zh-TW',
    watermark: 'text',
    fullscreenButton: 'force',
    pipButton: false,
    playbackRates: [1, 2],
  },
  // Every theme group and field is optional.
  theme: { colors: { primary: '#4caf50' }, subtitles: { textScale: 1.2, textAlign: 'auto' } },
  settings: { actionOverrides: { next: 'event', fullscreen: 'default' } },
  playlist: [
    {
      id: 'item',
      time: 10,
      quality: 720,
      poster: { src: 'https://example.com/poster.jpg' },
      files: {
        list: [{ name: 'Group', items: [{ name: 'a.pdf', url: 'https://example.com/a.pdf' }] }],
      },
      cta: [{ button: { text: 'Go', url: 'https://example.com' }, trigger: { pause: true } }],
      ad: [{ adTagUrl: 'https://example.com/vast.xml' }],
    },
  ],
};

export const misspelledTextScale: CreateOptions = {
  url: 'https://kinescope.io/embed/123',
  // The old key with a Cyrillic "с" is gone.
  // @ts-expect-error
  theme: { subtitles: { textSсale: 1 } },
};

// @ts-expect-error The factory has no `playerId`.
export type FactoryPlayerId = Kinescope.IframePlayer['playerId'];

export function useEvents(player: Player): void {
  player.on(player.Events.Seeking, ({ data }) => data.currentTime.toFixed());
  player.on(player.Events.Seeked, ({ data }) => data.currentTime.toFixed());
  player.on(player.Events.Play, ({ data }) => data.replay && data.suspended);
  player.on(player.Events.Pause, ({ data }) => data.ended);
  player.on(player.Events.TimeUpdate, ({ data }) => data.duration - data.currentTime);
  player.on(player.Events.QualityChanged, ({ data }) => data.auto);
  player.on(player.Events.AdBreakStateChanged, ({ data }) => {
    const active: boolean = data.active;
    return active;
  });
  player.on(player.Events.Unsupported, ({ data }) => data.error);
  player.on(player.Events.Error, ({ data }) => data.code);
  player.on(player.Events.NextActionPerformed, ({ data }) => data);
}

export async function useMethods(player: Player): Promise<void> {
  await player.play({ allowMuted: true });
  await player.enableTextTrack();
  await player.switchTo([0, 1]);
  const chapters = await player.getChapters('item');
  chapters.map((chapter) => chapter.position);
  await player.getPlaylistSnapshot();
  await player.castPrompt();
}

export function useFactory(factory: Kinescope.IframePlayer): void {
  const onCreated: Kinescope.IframePlayer.FactoryEventHandler<'created'> = ({ data }) => {
    data.play().catch(() => {});
  };
  factory.on(factory.Events.Created, onCreated);
  factory.off(factory.Events.Created, onCreated);
  factory.on(factory.Events.CreateLazyFailed, ({ data }) => data);
  factory
    .lazy('player', { url: 'https://kinescope.io/embed/123', visiblePart: 0.5 })
    .catch(() => {});
}

export async function updateOptions(player: Player): Promise<void> {
  await player.setOptions({
    size: { width: 640 },
    ui: { controls: false, watermark: 'text' },
    theme: { colors: { primary: '#000' } },
    behavior: { playlist: { loop: true } },
  });
  // @ts-expect-error Only `behavior.playlist` can be updated.
  await player.setOptions({ behavior: { muted: true } });
}
