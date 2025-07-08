import type { PlayerEvents } from './PlayerEvents';

declare const PlayerEvents: Kinescope.IframePlayer.Player.Events;

type DefineAll<
  Enum extends string | number | symbol,
  T extends Record<Enum, unknown>,
> = keyof T extends Enum ? T : never;

// eslint-disable-next-line @typescript-eslint/no-use-before-define
export { Kinescope };

declare global {
  namespace Kinescope {
    export namespace IframePlayer {
      export type VideoQuality = number | 'auto';

      export interface PlaylistItemOptions {
        /** Заголовок видео-ролика. Отображается в верхней части плеера. */
        title?: string;

        /** Подзаголовок видео-ролика. Отображается под основным заголовком. */
        subtitle?: string;

        /** Картинка с постером для видео-ролика. */
        poster?: string;

        /** Субтитры (Video text tracks). */
        vtt?: {
          /** Заголовок */
          label: string;
          /** Url файла субтитров */
          src: string;
          /** Язык субтитров */
          srcLang: string;
        }[];

        /** Главы - разделение отрезков времени. */
        chapters?: {
          /** Точка времени (в секундах) */
          position: number;
          /** Заголовок */
          title: string;
        }[];

        /** Дополнительные материалы для скачивания. */
        files?: {
          list: {
            name: string;
            url: string;
            mime: string;
            size?: number;
          }[];
          archiveUrl?: string;
        };

        /** @experimental Закладки, привязанные ко времени. */
        bookmarks?: {
          id: string;
          /** Время в секундах. */
          time: number;
        }[];

        /** @experimental Призывы к действию (CTA). */
        cta?: {
          id: string;
          title?: string;
          description?: string;
          /** Возможность закрыть/пропустить. */
          skippable?: boolean;
          button: {
            text: string;
            style?: object;
          };
          /** Срабатывание CTA */
          trigger: {
            /** Процент текущего времени, например: `[0, 100]`. */
            percentages?: number[];
            /** Точки времени (сек.), например: `[60, 600]`. */
            timePoints?: number[];
            /** На паузе */
            pause?: boolean;
          };
        }[];

        /** DRM. */
        drm?: {
          auth?: {
            /** Пользовательский токен для авторизации при запросе лицензии. */
            token?: string;
          };
        };

        /** Реклама. */
        ad?: (
          | {
              /** Url рекламного тега. */
              adTagUrl: string | string[];
            }
          | {
              /** @experimental Готовый текст рекламного тега. */
              adTag: string | string[];
            }
        ) & {
          /** Срабатывание рекламы. */
          trigger?: {
            /** Процент текущего времени, например: `[0, 100]`. */
            percentages?: number[];
            /** Точки времени (сек.), например: `[60, 600]`. */
            timePoints?: number[];
            /** Повтор (сек), например: `600`, каждые 10 мин. */
            interval?: number;
          };
        };
      }

      export interface UpdatablePlayerOptions {
        ui?: Pick<NonNullable<CreateOptions['ui']>, 'watermark'>;
      }

      interface PlaylistOptions {
        /** Автопереключение роликов в плейлисте. Defaults to `true`. */
        autoSwitch?: boolean;
        /** @experimental Initial track in a playlist. PlaylistItem ID. */
        initialItem?: string;
        /** Повторять весь плейлист. Defaults to `false`. */
        loop?: boolean;
      }

      export interface CreateOptions {
        /** Url видео */
        url: string;

        /** Настройки размера */
        size?: {
          /** Ширина плеера. */
          width?: number | string;
          /** Высота плеера. */
          height?: number | string;
        };

        /** Настройки поведения */
        behavior?: {
          /**
           * - `none`, `false` - не осуществлять предзагрузку видео (только постер, экономия ресурсов страницы). По умолчанию для мобильных устройств.
           * - `metadata`, `true` - предварительно загружаются необходимые данные видео. По умолчанию (кроме мобильных устройств).
           * - `auto` - предзагрузка на усмотрение браузера и видео драйвера.
           */
          preload?: boolean | 'none' | 'metadata' | 'auto';
          /** Запоминать время воспроизведения, настройки субтитров и т.д. По умолчанию `true`. */
          localStorage?:
            | boolean
            | {
                /**
                 * - `item` - запоминать для каждого ролика отдельно.
                 * - true | `global` - запоминать глобально, на все ролики.
                 * - false - не запоминать.
                 * По умолчанию `global`.
                 */
                quality?: 'item' | 'global' | boolean;
                /** Запоминать время. */
                time?: boolean;
                /** Запоминать язык субтитров. Аналогично `quality`. */
                textTrack?: 'item' | 'global' | boolean;
              };
          /**
           * В случае, если браузер не поддерживает полноэкранный режим для элементов можно указать запасной вариант.
           * - `video` - полноэкранный режим видео элемента. Применяется в iOS.
           * - `pseudo` - растянуть плеер в окне браузера поверх всех других элементов (псевдофулскрин).
           * По умолчанию `video`.
           */
          fullscreenFallback?: 'video' | 'pseudo';
          /** Воспроизводить видео на мобильных устройствах не переходя автоматически в полноэкранный режим. По умолчанию `true`. */
          playsInline?: boolean;
          /** Зацикленное видео. */
          loop?: boolean;
          /**
           * Автоматический запуск плеера.
           * Если не удалось начать воспроизведение со звуком, то плеер попытается начать воспроизведение с выключенным звуком.
           *
           * `viewable` - автоматический запуск при появлении плеера в области видимости на странице.
           * Применимо когда плеер находится внизу страницы и до его появления нужно прокрутить страницу.
           */
          autoPlay?: boolean | 'viewable';
          /** Ставить на паузу (если `true`) или сбрасывать на начальное состояние (если `reset`), если другой плеер на странице начал проигрывание. По умолчанию `true`. */
          autoPause?: boolean | 'reset';
          /**
           * @experimental
           *
           * `visible` - воспроизведение приостанавливается, если плеер вне области видимости на странице. */
          playback?: 'visible';
          /** Выключить звук. */
          muted?: boolean;
          /**
           * Включать ли субтитры при загрузке видео.
           * - `true` - автовыбор в следующем порядке: на языке браузера, на языке плеера, первый в списке.
           * - `string` - включать дорожку с указанным языком. */
          textTrack?: boolean | string;
          /** Настройки для плейлиста. */
          playlist?: PlaylistOptions;
        };

        /** Настройки UI */
        ui?: {
          /** Язык плеера. По умолчанию язык браузера или английский язык. */
          language?: 'ru' | 'en';
          /** Показывать ли элементы управления плеером. По умолчанию `true`. */
          controls?: boolean;
          /** Большая кнопка Play в центре плеера, по умолчанию `true`. */
          mainPlayButton?: boolean;
          /** Показывать ли кнопку выбора скорости воспроизведения. */
          playbackRateButton?: boolean;
          /** Водяной знак. */
          watermark?: {
            /** Текст */
            text: string;
            /**
             * - `stripes` - линиями;
             * - `random` - в случайных местах;
             * По умолчанию `random`.
             */
            mode?: 'stripes' | 'random';
            /** Коэффициент масштабирования размера текста в зависимости от размера плеера. По умолчанию `0.25`. */
            scale?: number;
            /** Длительность показа/скрытия (мс). Если не указано, текст показывается постоянно. */
            displayTimeout?: number | { visible: number; hidden: number };
          };
        };

        /** Настройки темы. */
        theme?: {
          subtitles?: {
            /** Base font size in em. */
            textSсale: number;
            textAlign: 'left' | 'center';
            textLength: 'auto' | number;
          };
          watermark: {
            default: {
              /** CSS color. */
              color: string;
            };
          };
          colors: {
            /** Цвет плеера. Например: #4caf50. */
            primary: string;
          };
        };

        /** Настройки для плеера. */
        settings?: {
          /** Какой-либо пользовательский идентификатор. Используется для отправки метрик. */
          externalId?: string;
        };

        /**
         * Настройки, относящиеся к ролику: заголовки, субтитры, drm и т.д.
         * См. метод плеера `setPlaylistItemOptions`.
         */
        playlist?: PlaylistItemOptions[];

        /** @internal @experimental */
        keepElement?: boolean;
      }

      export interface Player {
        readonly Events: Player.Events;

        on<T extends Player.EventType>(event: T, handler: Player.EventHandler<T>): this;
        once<T extends Player.EventType>(event: T, handler: Player.EventHandler<T>): this;
        off<T extends Player.EventType>(event: T, handler: Player.EventHandler<T>): this;

        isPaused(): Promise<boolean>;

        isEnded(): Promise<boolean>;

        isMuted(): Promise<boolean>;

        getCurrentTime(): Promise<number>;

        getDuration(): Promise<number>;

        play(): Promise<void>;

        pause(): Promise<void>;

        stop(): Promise<void>;

        seekTo(time: number): Promise<void>;

        mute(): Promise<void>;

        unmute(): Promise<void>;

        getVolume(): Promise<number>;

        setVolume(value: number): Promise<void>;

        getPlaybackRate(): Promise<number>;

        setPlaybackRate(value: number): Promise<void>;

        getVideoQualityList(): Promise<readonly VideoQuality[]>;

        getVideoQuality(): Promise<VideoQuality>;

        setVideoQuality(quality: VideoQuality): Promise<void>;

        enableTextTrack(lang: string): Promise<void>;

        disableTextTrack(): Promise<void>;

        isFullscreen(): Promise<boolean>;

        setFullscreen(fullscreen: boolean): Promise<void>;

        isPip(): Promise<boolean>;

        setPip(pip: boolean): Promise<void>;

        setPlaylistItemOptions(options: PlaylistItemOptions): Promise<void>;

        getPlaylistItem(): Promise<{ readonly id: string | undefined } | undefined>;

        switchTo(id: string): Promise<void>;

        next(): Promise<void>;

        previous(): Promise<void>;

        closeCTA(): Promise<void>;

        setOptions(options: UpdatablePlayerOptions): Promise<void>;

        destroy(): Promise<void>;
      }

      export namespace Player {
        export type EventType = PlayerEvents[keyof PlayerEvents];
        export type Events = PlayerEvents;

        export type EventMap = DefineAll<
          EventType,
          {
            [PlayerEvents.Ready]: {
              currentTime: number;
              duration: number;
              quality: VideoQuality;
              audioTrack: string;
            };
            [PlayerEvents.CurrentTrackChanged]: {
              item: { id?: string };
            };
            [PlayerEvents.SizeChanged]: {
              width: number;
              height: number;
            };
            [PlayerEvents.QualityChanged]: {
              quality: VideoQuality;
            };
            [PlayerEvents.Play]: undefined;
            [PlayerEvents.Playing]: undefined;
            [PlayerEvents.Pause]: undefined;
            [PlayerEvents.Ended]: undefined;
            [PlayerEvents.TimeUpdate]: {
              currentTime: number;
              percent: number;
            };
            [PlayerEvents.Waiting]: undefined;
            [PlayerEvents.Progress]: {
              bufferedTime: number;
            };
            [PlayerEvents.DurationChange]: {
              duration: number;
            };
            [PlayerEvents.VolumeChange]: {
              volume: number;
              muted: boolean;
            };
            [PlayerEvents.PlaybackRateChange]: {
              playbackRate: number;
            };
            [PlayerEvents.Seeked]: undefined;
            [PlayerEvents.SeekChapter]: {
              position: number;
            };
            [PlayerEvents.FullscreenChange]: {
              isFullscreen: boolean;
              type: 'video' | 'pseudo' | 'native';
            };
            [PlayerEvents.PipChange]: {
              isPip: boolean;
            };
            [PlayerEvents.CallAction]: {
              id: string;
            };
            [PlayerEvents.CallBookmark]: {
              id: string;
              time: number;
            };
            [PlayerEvents.AdBreakStateChanged]: {
              active: true;
            };
            [PlayerEvents.ControlBarVisibilityChanged]: {
              visible: boolean;
            };
            [PlayerEvents.Error]: {
              error: unknown;
            };
            [PlayerEvents.Destroy]: undefined;
          }
        >;

        export type EventHandler<T extends EventType = EventType> = (event: {
          readonly type: T;
          readonly target: Player;
          readonly data: EventMap[T];
        }) => void;
      }
    }

    export interface IframePlayer {
      readonly version: string;
      readonly playerId: string;
      /** Create new player. */
      create(
        elementOrId: HTMLElement | string,
        options: IframePlayer.CreateOptions
      ): Promise<IframePlayer.Player>;
      /** Returns player by id. */
      getById(elementId: string): IframePlayer.Player | undefined;
      /** Returns all created players. */
      getAll(): readonly IframePlayer.Player[];
    }
  }

  interface Kinescope {
    readonly IframePlayer?: Kinescope.IframePlayer;
  }

  // eslint-disable-next-line vars-on-top, no-var
  var Kinescope: Kinescope | undefined;
}
