import { Activity, act, type ReactNode } from 'react';
import { cleanup, render } from '@testing-library/react';
import KinescopePlayer from '../src/react/KinescopePlayer.js';

type Player = Kinescope.IframePlayer.Player;

interface PendingCreate {
  readonly iframe: HTMLIFrameElement;
  readonly resolve: () => Player;
}

let pending: PendingCreate[];
let created: Player[];
let destroyed: Player[];
let overlapping: boolean;
let active: number;

function createPlayer(): Player {
  const player = {
    Events: { Destroy: 'destroy' },
    destroy: vi.fn(async () => {
      destroyed.push(player);
    }),
    once: vi.fn(),
  } as unknown as Player;
  return player;
}

function installFactory(): void {
  const factory = {
    version: '2.202.2',
    isLatestVersion: true,
    create: vi.fn(
      (iframe: HTMLIFrameElement) =>
        new Promise<Player>((resolve) => {
          active += 1;
          if (active > 1) overlapping = true;
          pending.push({
            iframe,
            resolve: () => {
              active -= 1;
              const player = createPlayer();
              created.push(player);
              resolve(player);
              return player;
            },
          });
        })
    ),
  };
  (window as { Kinescope?: unknown }).Kinescope = { IframePlayer: factory };
}

async function flush(ms = 0): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
}

function App({
  mode,
  onCreate,
}: {
  mode: 'visible' | 'hidden';
  onCreate: (player: Player) => void;
}): ReactNode {
  return (
    <Activity mode={mode}>
      <KinescopePlayer options={{ url: 'https://kinescope.io/123' }} onCreate={onCreate} />
    </Activity>
  );
}

beforeEach(() => {
  pending = [];
  created = [];
  destroyed = [];
  overlapping = false;
  active = 0;
  installFactory();
});

afterEach(() => {
  cleanup();
  delete (window as { Kinescope?: unknown }).Kinescope;
});

describe('KinescopePlayer', () => {
  it('creates a player', async () => {
    const onCreate = vi.fn();
    render(<App mode="visible" onCreate={onCreate} />);
    await flush();

    expect(pending).toHaveLength(1);
    const player = await act(async () => pending[0]!.resolve());
    await flush();

    expect(onCreate).toHaveBeenCalledWith(player);
  });

  it('does not create a second player in the iframe until the pending one is destroyed', async () => {
    const onCreate = vi.fn();
    const { rerender } = render(<App mode="visible" onCreate={onCreate} />);
    await flush();
    expect(pending).toHaveLength(1);

    // The effect re-runs while `create()` is pending.
    rerender(<App mode="hidden" onCreate={onCreate} />);
    rerender(<App mode="visible" onCreate={onCreate} />);
    await flush();
    expect(pending).toHaveLength(1);

    const stale = await act(async () => pending[0]!.resolve());
    await flush(20);

    // The stale player is destroyed, its document unloaded, and only then the next create starts.
    expect(destroyed).toEqual([stale]);
    expect(pending[0]!.iframe.getAttribute('src')).toBe('about:blank');
    expect(pending).toHaveLength(2);

    const current = await act(async () => pending[1]!.resolve());
    await flush();

    expect(overlapping).toBe(false);
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith(current);
    expect(created).toEqual([stale, current]);
  });

  it('destroys the player and unloads the iframe on unmount', async () => {
    const { unmount } = render(<App mode="visible" onCreate={vi.fn()} />);
    await flush();
    const player = await act(async () => pending[0]!.resolve());
    await flush();
    const { iframe } = pending[0]!;

    unmount();
    await flush();

    expect(destroyed).toEqual([player]);
    expect(iframe.getAttribute('src')).toBe('about:blank');
  });
});
