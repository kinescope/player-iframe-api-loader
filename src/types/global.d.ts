/**
 * Global types of the Kinescope IFrame Player API: the `Kinescope` namespace and `window.Kinescope`.
 *
 * A script (not a module), so the ESM and CommonJS entry points reference the same declarations
 * instead of declaring them twice.
 */

declare namespace Kinescope {
  export namespace IframePlayer {
    export type VideoQuality = number | 'auto';

    /** Индексы элементов плейлиста (вложенные группы). */
    export type PlaylistPath = readonly number[];

    /** CSS-свойства в формате React (`backgroundColor`, `fontSize` и т.д.). */
    export type CSSProperties = Readonly<Record<string, string | number | undefined>>;

    export interface PosterOptions {
      /** Url картинки. */
      src: string;
      /** Url картинки низкого качества, показывается пока загружается основная. */
      src0?: string;
      crossOrigin?: 'anonymous' | 'use-credentials';
    }

    export interface ChapterItem {
      /** Точка времени (в секундах) */
      position: number;
      /** Заголовок */
      title: string;
    }

    interface FileItem {
      name: string;
      url: string;
      size?: number;
      /** @deprecated Плеер не использует это поле. */
      mime?: string;
    }

    interface FilesGroupItem {
      name: string;
      items: FileItem[];
    }

    interface AdItemYaOptions {
      // См. https://yandex.ru/dev/video-sdk/doc/ru/sdk-html5/AdConfig-interface
      adConfig: Record<string, unknown>;
      // См. https://yandex.ru/dev/video-sdk/doc/ru/sdk-html5/PlaybackParameters-interface
      playbackParameters?: Record<string, unknown>;
    }

    type AdItemOptions = (
      | {
          /** Url рекламного тега. */
          adTagUrl: string | string[];
        }
      | {
          /** @experimental Готовый текст рекламного тега. */
          adTag: string | string[];
        }
      | {
          /** @experimental Настройки для Yandex Video Ads SDK. */
          yaOptions: AdItemYaOptions | AdItemYaOptions[];
        }
    ) & {
      id?: string;
    };

    interface AdTriggerOptions {
      /** Процент текущего времени, например: `[0, 100]`. */
      percentages?: number[];
      /** Точки времени (сек.), например: `[60, 600]`. */
      timePoints?: number[];
      /** Повтор (сек), например: `600`, каждые 10 мин. */
      interval?: number;
    }

    export interface PlaylistItemOptions {
      /** ID ролика. */
      id?: string;

      /** Заголовок видео-ролика. Отображается в верхней части плеера. */
      title?: string;

      /** Подзаголовок видео-ролика. Отображается под основным заголовком. */
      subtitle?: string;

      /** Картинка с постером для видео-ролика. */
      poster?: string | PosterOptions;

      /** Время, с которого начинается воспроизведение (сек). */
      time?: number;

      /** Начальное качество видео. */
      quality?: VideoQuality;

      /** Наименования качеств в меню выбора качества. */
      qualityLabels?: Record<number, string | { label: string; q?: number }> & {
        format?: true;
        ranges?: boolean;
      };

      /** Начальная звуковая дорожка. */
      audioTrack?: string;

      /** Наименования звуковых дорожек в меню выбора. */
      audioTrackLabels?: Record<string, string>;

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
      chapters?: ChapterItem[];

      /** Дополнительные материалы для скачивания. */
      files?: {
        list: (FileItem | FilesGroupItem)[];
        archiveUrl?: string;
      };

      /** @experimental Закладки, привязанные ко времени. */
      bookmarks?: {
        id: string;
        /** Время в секундах. */
        time: number;
        title?: string;
        style?: CSSProperties;
      }[];

      /** @experimental Призывы к действию (CTA). */
      cta?: {
        id?: string;
        title?: string;
        description?: string;
        /** Возможность закрыть/пропустить. */
        skippable?: boolean;
        button: {
          text: string;
          url?: string;
          style?: CSSProperties;
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
      ad?: AdItemOptions | (AdItemOptions & { trigger?: AdTriggerOptions })[];

      /**
       * @experimental Вступительный ролик из каталога (не реклама).
       * Проигрывается перед контентом вместо преролла, остальная реклама из `ad` работает как обычно.
       */
      intro?: {
        /** VAST вступительного ролика. */
        adTag: string;
        /** Текст кнопки-ссылки. */
        buttonText?: string;
        /** Url кнопки-ссылки. */
        buttonUrl?: string;
      };
    }

    /** Опции, которые можно изменить после создания плеера методом `setOptions`. */
    export interface UpdatablePlayerOptions {
      size?: CreateOptions['size'];
      ui?: CreateOptions['ui'];
      theme?: CreateOptions['theme'];
      behavior?: Pick<NonNullable<CreateOptions['behavior']>, 'playlist'>;
    }

    interface PlaylistOptions {
      /** Автопереключение роликов в плейлисте. Defaults to `true`. */
      autoSwitch?: boolean;
      /** @experimental Initial track in a playlist. PlaylistItem ID or path. */
      initialItem?: string | PlaylistPath;
      /** Повторять весь плейлист. Defaults to `false`. */
      loop?: boolean;
    }

    /**
     * - `item` - запоминать для каждого ролика отдельно.
     * - true | `global` - запоминать глобально, на все ролики.
     * - false - не запоминать.
     */
    type LocalStorageScope = 'item' | 'global' | boolean;

    interface LocalStorageOptions {
      /** Запоминать качество. По умолчанию `global`. */
      quality?: LocalStorageScope;
      /** Запоминать язык субтитров. Аналогично `quality`. */
      textTrack?: LocalStorageScope;
      /** Запоминать звуковую дорожку. Аналогично `quality`. */
      audioTrack?: LocalStorageScope;
      /**
       * Запоминать время. По умолчанию `true`.
       * - `item` - запоминать для каждого ролика отдельно.
       * - true | `playlist` - запоминать с учетом плейлиста, в который входит ролик.
       * - false - не запоминать.
       */
      time?:
        | boolean
        | 'item'
        | 'playlist'
        | {
            /** Минимальное время (сек), которое нужно запомнить. */
            min: number;
            scope: 'item' | 'playlist';
          };
      /** Запоминать скорость воспроизведения. По умолчанию `true`. */
      playbackRate?: boolean;
      /** Запоминать настройки звука. По умолчанию `true`. */
      volume?: boolean;
      /** @experimental Запоминать состояние плейлиста. По умолчанию `true`. */
      playlist?: boolean | { autoSwitch: boolean; initialItem: boolean };
      /** Место хранения. По умолчанию `local`. */
      storage?: 'local' | 'session';
    }

    interface WatermarkOptions {
      /** Текст. Для переноса строк применяется спецсимвол `\n`. */
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
    }

    export interface CreateOptions {
      /** Url видео */
      url: string | URL;

      /** ID плеера. По умолчанию id html элемента, для которого создается плеер. */
      playerId?: string;

      /** Таймаут создания плеера (в миллисекундах). По умолчанию 30000. */
      timeout?: number;

      /**
       * Сколько может длиться одна попытка подключения к iframe (в миллисекундах). По умолчанию 15000.
       * Не больше оставшегося `timeout`.
       */
      attemptTimeout?: number;

      /**
       * Показывать экран ошибки с кнопкой «Повторить» при ошибках сети и таймаутах. По умолчанию `true`.
       */
      errorScreen?: boolean;

      /** Url домена главной страницы. По умолчанию `*`. */
      origin?: string;

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
        localStorage?: boolean | LocalStorageOptions;
        /** Управление плеером с клавиатуры. По умолчанию `true`. */
        keyboard?:
          | boolean
          | {
              /** Перемотка стрелками. */
              seek?: boolean;
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
         *
         * `hover` (experimental) - воспроизведение, пока курсор над плеером. До первого клика по плееру.
         */
        autoPlay?: boolean | 'viewable' | 'hover';
        /** Ставить на паузу (если `true`) или сбрасывать на начальное состояние (если `reset`), если другой плеер на странице начал проигрывание. По умолчанию `true`. */
        autoPause?: boolean | 'reset';
        /**
         * @experimental
         *
         * - `visible` - воспроизведение приостанавливается, если плеер вне области видимости на странице.
         * - `normal` - обычное воспроизведение.
         * По умолчанию `normal`.
         */
        playback?: 'normal' | 'visible';
        /** Скорость воспроизведения (1 - нормальная скорость). */
        playbackRate?: number;
        /** Выключить звук. */
        muted?: boolean;
        /** Уровень громкости от 0 до 1. */
        volume?: number;
        /**
         * Включать ли субтитры при загрузке видео.
         * - `true` - автовыбор в следующем порядке: на языке браузера, на языке плеера, первый в списке.
         * - `string` - включать дорожку с указанным языком. */
        textTrack?:
          | boolean
          | string
          | {
              /** @experimental Вариант отображения субтитров. По умолчанию `rollup`. */
              variant?: 'classic' | 'rollup';
            };
        /** @experimental Максимальное качество при автовыборе. */
        maxAbrQuality?: number;
        /**
         * @experimental Не давать экрану гаснуть во время воспроизведения.
         * По умолчанию `true` в мобильном режиме.
         */
        screenWakeLock?: boolean;
        /** Настройки для плейлиста. */
        playlist?: PlaylistOptions;
      };

      /** Настройки UI */
      ui?: {
        /** Язык плеера. По умолчанию язык браузера или английский язык. */
        language?:
          | 'ru'
          | 'en'
          | 'es'
          | 'pt'
          | 'pt-BR'
          | 'ar'
          | 'de'
          | 'fr'
          | 'it'
          | 'ja'
          | 'ko'
          | 'zh'
          | 'zh-TW';
        /** Показывать ли элементы управления плеером. По умолчанию `true`. */
        controls?: boolean;
        /** Большая кнопка Play в центре плеера, по умолчанию `true`. */
        mainPlayButton?: boolean;
        /** Показывать ли заголовок и подзаголовок. По умолчанию `true`. */
        title?: boolean;
        /** Прозрачный фон плеера. По умолчанию `true`. */
        transparent?: boolean;
        /** Логотип. */
        branding?: {
          /** Url логотипа. */
          imageUrl: string;
          /** Заголовок (alt, title). */
          title?: string;
          /** Ссылка на страницу бренда. */
          url?: string;
        };
        /**
         * Список скоростей воспроизведения в меню настроек.
         * `true` или не указано — список по умолчанию, `false` или `[]` — скрыть выбор скорости.
         */
        playbackRates?: readonly number[] | boolean;
        buttonsBar?: boolean;
        progressBar?: boolean;
        time?: boolean;
        chapterTitle?: boolean;
        playButton?: boolean;
        volumeButton?: boolean;
        settingsButton?: boolean;
        subtitlesButton?: boolean;
        audioTracksButton?: boolean;
        chaptersButton?: boolean;
        attachmentsButton?: boolean;
        playlistButton?: boolean;
        autoSwitchButton?: boolean;
        previousButton?: boolean | 'force';
        nextButton?: boolean | 'force';
        liveButton?: boolean;
        pipButton?: boolean;
        airplayButton?: boolean;
        chromecastButton?: boolean;
        chatButton?: boolean | 'fullscreen';
        /** Показывать ли кнопку выбора скорости воспроизведения. */
        playbackRateButton?: boolean;
        fullscreenButton?: boolean | 'force';
        /** @experimental Кнопка индикации автозапуска без звука. По умолчанию `true`. */
        playSoundButton?: boolean;
        /** @experimental */
        screenshotButton?: boolean;
        /** @experimental */
        transcriptionButton?: boolean;
        /** Водяной знак. */
        watermark?: string | WatermarkOptions;
      };

      /** Настройки темы. */
      theme?: {
        subtitles?: {
          /** Base font size in em. */
          textScale?: number;
          textAlign?: 'left' | 'center' | 'auto';
          textLength?: 'auto' | number;
          /** CSS color. */
          textColor?: string;
          /** CSS color. */
          backgroundColor?: string;
          backgroundOpacity?: number;
          rollup?: {
            /** Количество строк, минимум `1`. */
            rows?: number;
            transitionDuration?: number;
          };
        };
        watermark?: {
          default?: CSSProperties;
          random?: CSSProperties;
          stripes?: CSSProperties;
        };
        colors?: {
          /** Цвет плеера. Например: #4caf50. */
          primary?: string;
          primaryDark?: string;
          primaryLight?: string;
          accent?: string;
          spinner?: string;
          hidden?: string;
          overlay?: string;
        };
      };

      /** Настройки для плеера. */
      settings?: {
        /** Какой-либо пользовательский идентификатор. Используется для отправки метрик. */
        externalId?: string;
        /**
         * @experimental Вместо встроенного действия кнопки отправлять событие
         * (`FullscreenActionPerformed`, `NextActionPerformed` и т.д.).
         */
        actionOverrides?: {
          fullscreen?: 'default' | 'event';
          screenshot?: 'default' | 'event';
          transcription?: 'default' | 'event';
          previous?: 'default' | 'event';
          next?: 'default' | 'event';
          chapterTitle?: 'default' | 'event';
        };
      };

      /**
       * Настройки, относящиеся к ролику: заголовки, субтитры, drm и т.д.
       * См. метод плеера `setPlaylistItemOptions`.
       */
      playlist?: PlaylistItemOptions[];

      /** @internal @experimental */
      keepElement?: boolean;
    }

    interface SwitchToOptions {
      autoPlay?: boolean;
      time?: number;
    }

    interface PlayOptions {
      /** Если запустить со звуком не удалось (NotAllowedError), попробовать запустить без звука. */
      allowMuted?: boolean;
    }

    export interface Player {
      readonly Events: Player.Events;

      readonly playerId: string;

      on<T extends Player.EventType>(event: T, handler: Player.EventHandler<T>): this;
      once<T extends Player.EventType>(event: T, handler: Player.EventHandler<T>): this;
      off<T extends Player.EventType>(event: T, handler: Player.EventHandler<T>): this;

      isPaused(): Promise<boolean>;

      isEnded(): Promise<boolean>;

      isMuted(): Promise<boolean>;

      getCurrentTime(): Promise<number>;

      getDuration(): Promise<number>;

      play(options?: PlayOptions): Promise<void>;

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

      /** Включить субтитры на указанном языке или дорожку по умолчанию. */
      enableTextTrack(lang?: string): Promise<void>;

      disableTextTrack(): Promise<void>;

      isFullscreen(): Promise<boolean>;

      setFullscreen(fullscreen: boolean): Promise<void>;

      isPip(): Promise<boolean>;

      setPip(pip: boolean): Promise<void>;

      setPlaylistItemOptions(options: PlaylistItemOptions): Promise<void>;

      /** @experimental Текущий или указанный ролик плейлиста. */
      getPlaylistItem(
        pathOrId?: PlaylistPath | string
      ): Promise<{ readonly id: string | undefined } | undefined>;

      /** @experimental Ролики плейлиста. */
      getPlaylistSnapshot(): Promise<readonly PlaylistItemOptions[]>;

      /** Главы текущего или указанного ролика. */
      getChapters(pathOrId?: PlaylistPath | string): Promise<readonly ChapterItem[]>;

      /** @experimental Переключиться на ролик плейлиста. */
      switchTo(pathOrId: PlaylistPath | string, options?: SwitchToOptions): Promise<void>;

      /** @experimental Следующий ролик плейлиста. */
      next(): Promise<void>;

      /** @experimental Предыдущий ролик плейлиста. */
      previous(): Promise<void>;

      /** @experimental Закрыть CTA. */
      closeCTA(): Promise<void>;

      /** @experimental Показать выбор устройства AirPlay. */
      airPlayPrompt(): Promise<void>;

      /** @experimental Показать выбор устройства Chromecast. */
      castPrompt(): Promise<void>;

      /**
       * Изменить опции после создания плеера: `size`, `ui`, `theme` и `behavior.playlist`.
       * Меняются только переданные опции.
       */
      setOptions(options: UpdatablePlayerOptions): Promise<void>;

      destroy(): Promise<void>;
    }

    export namespace Player {
      /** Event types, `player.Events`. */
      export interface Events {
        readonly LoadStart: unique symbol;
        readonly Loaded: unique symbol;
        /** @deprecated Use `Loaded`. */
        readonly Ready: unique symbol;
        /** @experimental */
        readonly CurrentTrackChanged: unique symbol;
        /** @experimental */
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
        readonly Seeking: unique symbol;
        readonly Seeked: unique symbol;
        /** @experimental */
        readonly SeekChapter: unique symbol;
        readonly FullscreenChange: unique symbol;
        readonly PipChange: unique symbol;
        /** @experimental */
        readonly CallAction: unique symbol;
        /** @experimental */
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
        /** @experimental */
        readonly NextActionPerformed: unique symbol;
        /** @experimental */
        readonly PreviousActionPerformed: unique symbol;
        /** @experimental */
        readonly ChapterTitleActionPerformed: unique symbol;
        readonly Error: unique symbol;
        /** Воспроизведение невозможно в этой среде (нет кодека, CDM и т.п.). `Error` в этом случае не отправляется. */
        readonly Unsupported: unique symbol;
        readonly Destroy: unique symbol;
      }

      export type EventType = Events[keyof Events];

      /** Данные событий `Error` и `Unsupported`. */
      export interface ErrorEventData {
        error: unknown;
        /** Тип ошибки: `network`, `media`, `manifest`, `drm`, `device`, `generic`. */
        type?: string;
        category?: string;
        /** Код ошибки, например `ERR-NET-TIMEOUT`. */
        code?: string;
        severity?: 'fatal' | 'warning' | 'info';
        /** Источник ошибки. */
        path?: string;
        /** Ограничение среды, а не сбой плеера. */
        capability?: boolean;
        recoverable?: boolean;
        timestamp?: string;
      }

      interface LoadedEventData {
        currentTime: number;
        duration: number;
        quality: VideoQuality;
        audioTrack: string | undefined;
      }

      /** Event data by event name. Every event in `Events` must be here. */
      interface EventData {
        LoadStart: undefined;
        Loaded: LoadedEventData;

        Ready: LoadedEventData;
        CurrentTrackChanged: {
          item: { id?: string };
        };
        SizeChanged: {
          width: number;
          height: number;
        };
        QualityChanged: {
          quality: VideoQuality;
          /** Качество выбрано автоматически. */
          auto: boolean;
        };
        Play: {
          suspended: boolean;
          /** Воспроизведение началось заново после окончания. */
          replay: boolean;
        };
        Playing: undefined;
        Pause: {
          ended: boolean;
          suspended: boolean;
        };
        Ended: undefined;
        TimeUpdate: {
          currentTime: number;
          duration: number;
          percent: number;
          ended: boolean;
        };
        Waiting: undefined;
        Progress: {
          bufferedTime: number;
          duration: number;
        };
        DurationChange: {
          duration: number;
        };
        VolumeChange: {
          volume: number;
          muted: boolean;
        };
        PlaybackRateChange: {
          playbackRate: number;
        };
        Seeking: {
          currentTime: number;
        };
        Seeked: {
          currentTime: number;
        };
        SeekChapter: {
          position: number;
        };
        FullscreenChange: {
          isFullscreen: boolean;
          type: 'video' | 'pseudo' | 'native';
        };
        PipChange: {
          isPip: boolean;
        };
        CallAction: {
          id: string;
        };
        CallBookmark: {
          id: string;
          time: number;
        };
        AdBreakStateChanged: {
          active: boolean;
        };
        ControlBarVisibilityChanged: {
          visible: boolean;
        };
        FullscreenActionPerformed: undefined;
        ScreenshotActionPerformed: undefined;
        TranscriptionActionPerformed: undefined;
        NextActionPerformed: undefined;
        PreviousActionPerformed: undefined;
        ChapterTitleActionPerformed: undefined;
        Error: ErrorEventData;
        Unsupported: ErrorEventData;
        Destroy: undefined;
      }

      export type EventMap = { [K in keyof Events as Events[K]]: EventData[K] };

      export type EventHandler<T extends EventType = EventType> = (event: {
        readonly type: T;
        readonly target: Player;
        readonly data: EventMap[T];
      }) => void;
    }
  }

  export namespace IframePlayer {
    export interface CreateLazyOptions extends CreateOptions {
      /**
       * Какая часть плеера (от 0 до 1) должна попасть в область видимости, чтобы начать загрузку.
       * По умолчанию загрузка начинается заранее, до появления плеера.
       */
      visiblePart?: number;
    }

    /** События фабрики, `factory.Events`. */
    export interface FactoryEvents {
      /**
       * Плеер создан, в том числе кнопкой «Повторить» на экране ошибки после отклоненного `create()`.
       * `data` - плеер.
       */
      readonly Created: 'created';
      /** `lazy()` не смог создать плеер. `data` - та же ошибка, что и у отклоненного `create()`. */
      readonly CreateLazyFailed: 'createlazyfailed';
    }

    export type FactoryEventType = FactoryEvents[keyof FactoryEvents];

    export interface FactoryEventMap {
      created: Player;
      createlazyfailed: unknown;
    }

    export type FactoryEventHandler<T extends FactoryEventType = FactoryEventType> = (event: {
      readonly type: T;
      readonly target: IframePlayer;
      readonly data: FactoryEventMap[T];
    }) => void;
  }

  export interface IframePlayer {
    readonly version: string;

    readonly Events: IframePlayer.FactoryEvents;

    /** Create new player. */
    create(
      elementOrId: HTMLElement | string,
      options: IframePlayer.CreateOptions
    ): Promise<IframePlayer.Player>;

    /**
     * @experimental Создать плеер, когда он появится в области видимости страницы.
     * Плеер приходит в событии `Events.Created`, ошибка - в `Events.CreateLazyFailed`.
     */
    lazy(elementOrId: HTMLElement | string, options: IframePlayer.CreateLazyOptions): Promise<void>;

    on<T extends IframePlayer.FactoryEventType>(
      event: T,
      handler: IframePlayer.FactoryEventHandler<T>
    ): this;

    off<T extends IframePlayer.FactoryEventType>(
      event: T,
      handler: IframePlayer.FactoryEventHandler<T>
    ): this;
  }
}

interface Kinescope {
  readonly IframePlayer?: Kinescope.IframePlayer;
}

// eslint-disable-next-line vars-on-top, no-var
declare var Kinescope: Kinescope | undefined;
