/// <reference path="../src/types/global.d.ts" />

type LoaderModule = typeof import('../src/loader.js');

/** What happens to the next script tags the loader adds, in order. */
type ScriptOutcome = 'load' | 'error' | 'load-without-api' | 'silent';

const LATEST_URL = 'https://player.kinescope.io/latest/iframe.player.js';

let load: LoaderModule['load'];
let outcomes: ScriptOutcome[];
let appended: HTMLScriptElement[];

function createFactory(version = '2.202.2', isLatestVersion = true): Kinescope.IframePlayer {
  return { version, isLatestVersion, create: vi.fn() } as unknown as Kinescope.IframePlayer;
}

type ReadyHandler = (factory: Kinescope.IframePlayer) => void;
type PlayerGlobals = { Kinescope?: unknown; KinescopeIframeApiReadyHandlers?: ReadyHandler[] };

/**
 * What the player script does while it executes, before `load` fires (`entries/iframe-player`):
 * defines the factory and calls ready handlers, the queued ones and any pushed later.
 */
function initApi(factory = createFactory()): void {
  const win = window as PlayerGlobals;
  win.Kinescope = { IframePlayer: factory };
  const queued = win.KinescopeIframeApiReadyHandlers ?? [];
  const handlers: ReadyHandler[] = [];
  handlers.push = (...added: ReadyHandler[]): number => {
    added.forEach((handler) => handler(factory));
    return handlers.length;
  };
  win.KinescopeIframeApiReadyHandlers = handlers;
  handlers.push(...queued);
}

function settle(script: HTMLScriptElement, outcome: ScriptOutcome): void {
  if (outcome === 'silent') return;
  if (outcome === 'error') {
    script.dispatchEvent(new Event('error'));
    return;
  }
  if (outcome === 'load') initApi();
  script.dispatchEvent(new Event('load'));
}

function addForeignScript(src = LATEST_URL): HTMLScriptElement {
  const script = document.createElement('script');
  script.src = src;
  document.body.append(script);
  return script;
}

/** Resolves with the state of the promise after pending timers and microtasks have run. */
async function state(promise: Promise<unknown>): Promise<string> {
  let result = 'pending';
  promise.then(
    () => {
      result = 'resolved';
    },
    () => {
      result = 'rejected';
    }
  );
  await new Promise((resolve) => {
    setTimeout(resolve, 20);
  });
  return result;
}

beforeEach(async () => {
  vi.resetModules();
  ({ load } = await import('../src/loader.js'));
  outcomes = [];
  appended = [];
  const append = document.head.appendChild.bind(document.head);
  vi.spyOn(document.head, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
    append(node);
    if (node instanceof HTMLScriptElement) {
      appended.push(node);
      const outcome = outcomes.shift() ?? 'load';
      setTimeout(() => settle(node, outcome), 1);
    }
    return node;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (window as PlayerGlobals).Kinescope;
  delete (window as PlayerGlobals).KinescopeIframeApiReadyHandlers;
  document.querySelectorAll('script').forEach((script) => script.remove());
});

describe('load', () => {
  it('loads the latest version and returns the factory', async () => {
    const factory = await load();

    expect(factory).toBe(window.Kinescope?.IframePlayer);
    expect(appended.map((script) => script.src)).toEqual([LATEST_URL]);
    expect(document.scripts).toHaveLength(0);
  });

  it('builds the url from a version', async () => {
    outcomes = ['load-without-api'];

    await expect(load('2.1.0', { retries: 0 })).rejects.toThrow();

    expect(appended[0]?.src).toBe('https://player.kinescope.io/v2.1.0/iframe.player.js');
  });

  it('loads from a url', async () => {
    const url = new URL('https://cdn.example.com/player.js');
    await load(url);

    expect(appended[0]?.src).toBe(url.href);
  });

  it('returns the already loaded factory without adding a script', async () => {
    initApi();

    await expect(load()).resolves.toBe(window.Kinescope?.IframePlayer);
    expect(appended).toHaveLength(0);
  });

  it('shares one loading between parallel calls', async () => {
    const [first, second] = await Promise.all([load(), load()]);

    expect(first).toBe(second);
    expect(appended).toHaveLength(1);
  });

  it('retries after a network error', async () => {
    outcomes = ['error'];

    await expect(load(undefined, { retryDelay: 0 })).resolves.toBeDefined();
    expect(appended).toHaveLength(2);
    expect(document.scripts).toHaveLength(0);
  });

  it('rejects with the last error after all attempts and starts over on the next call', async () => {
    outcomes = ['error', 'error'];

    const error = (await load(undefined, { retries: 1, retryDelay: 0 }).catch(
      (e: unknown) => e
    )) as Error;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain('attempts: 2');
    expect(error.cause).toBeInstanceOf(Error);
    expect(document.scripts).toHaveLength(0);

    await expect(load()).resolves.toBeDefined();
    expect(appended).toHaveLength(3);
  });

  it('rejects instead of hanging when the script loads but the API is not initialized', async () => {
    outcomes = ['load-without-api'];

    await expect(load(undefined, { retries: 0 })).rejects.toThrow(
      expect.objectContaining({
        cause: expect.objectContaining({
          message: expect.stringContaining('API is not initialized'),
        }),
      })
    );
  });

  it('rejects when the script neither loads nor fails in time', async () => {
    outcomes = ['silent'];

    await expect(load(undefined, { retries: 0, timeout: 10 })).rejects.toThrow(
      expect.objectContaining({
        cause: expect.objectContaining({ message: expect.stringContaining('timed out') }),
      })
    );
    expect(document.scripts).toHaveLength(0);
  });

  it('waits for a foreign script with the same url instead of adding another one', async () => {
    const foreign = addForeignScript();

    const promise = load();
    expect(await state(promise)).toBe('pending');
    settle(foreign, 'load');

    await expect(promise).resolves.toBeDefined();
    expect(appended).toHaveLength(0);
  });

  it('replaces a foreign script that has already failed', async () => {
    const foreign = addForeignScript();
    foreign.dispatchEvent(new Event('error'));

    await expect(load(undefined, { timeout: 10 })).resolves.toBeDefined();
    expect(foreign.isConnected).toBe(false);
    expect(appended).toHaveLength(1);
  });

  it('rejects when another version is already loaded', async () => {
    initApi(createFactory('2.202.2', false));

    await expect(load('v2.1.0')).rejects.toThrow('Another version of the IframeApi');
    await expect(load('latest')).rejects.toThrow('Another version of the IframeApi');
    await expect(load('2.202.2')).resolves.toBeDefined();
    await expect(load(new URL('https://cdn.example.com/player.js'))).resolves.toBeDefined();
  });

  it('checks the version requested by a call that joined a loading in progress', async () => {
    const latest = load();
    const another = load('v2.1.0');

    await expect(latest).resolves.toBeDefined();
    await expect(another).rejects.toThrow('Another version of the IframeApi');
    expect(appended).toHaveLength(1);
  });
});
