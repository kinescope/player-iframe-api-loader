type DefineAll<
  Enum extends string | number | symbol,
  T extends Record<Enum, unknown>,
> = keyof T extends Enum ? T : never;

type PlayerEventKeys =
  | 'Ready'
  | 'CurrentTrackChanged'
  | 'SizeChanged'
  | 'QualityChanged'
  | 'Play'
  | 'Playing'
  | 'Pause'
  | 'Ended'
  | 'TimeUpdate'
  | 'Waiting'
  | 'Progress'
  | 'DurationChange'
  | 'VolumeChange'
  | 'PlaybackRateChange'
  | 'Seeked'
  | 'SeekChapter'
  | 'FullscreenChange'
  | 'PipChange'
  | 'CallAction'
  | 'CallBookmark'
  | 'AdBreakStateChanged'
  | 'ControlBarVisibilityChanged'
  | 'FullscreenActionPerformed'
  | 'ScreenshotActionPerformed'
  | 'TranscriptionActionPerformed'
  | 'Error'
  | 'Destroy';

type PlayerEvents = DefineAll<
  PlayerEventKeys,
  {
    readonly Ready: unique symbol;
    readonly CurrentTrackChanged: unique symbol;
    readonly SizeChanged: unique symbol;
    readonly QualityChanged: unique symbol;
    readonly Play: unique symbol;
    readonly Playing: unique symbol;
    readonly Pause: unique symbol;
    readonly Ended: unique symbol;
    readonly TimeUpdate: unique symbol;
    readonly Waiting: unique symbol;
    readonly Progress: unique symbol;
    readonly DurationChange: unique symbol;
    readonly VolumeChange: unique symbol;
    readonly PlaybackRateChange: unique symbol;
    readonly Seeked: unique symbol;
    readonly SeekChapter: unique symbol;
    readonly FullscreenChange: unique symbol;
    readonly PipChange: unique symbol;
    readonly CallAction: unique symbol;
    readonly CallBookmark: unique symbol;
    /** @experimental */
    readonly AdBreakStateChanged: unique symbol;
    /** @experimental */
    readonly ControlBarVisibilityChanged: unique symbol;
    /** @experimental */
    readonly FullscreenActionPerformed: unique symbol;
    /** @experimental */
    readonly ScreenshotActionPerformed: unique symbol;
    /** @experimental */
    readonly TranscriptionActionPerformed: unique symbol;
    readonly Error: unique symbol;
    readonly Destroy: unique symbol;
  }
>;

namespace PlayerEvents {
  export type Type = PlayerEvents[keyof PlayerEvents];
}

export type { PlayerEvents };
