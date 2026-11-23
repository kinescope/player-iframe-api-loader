# Kinescope Player Iframe API Loader

[![npm package](https://img.shields.io/npm/v/@kinescope/player-iframe-api-loader.svg?style=flat-square)](https://www.npmjs.org/package/@kinescope/player-iframe-api-loader)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://kinescope.io/)

A loader of the Kinescope Player [Iframe API](https://docs.kinescope.io/player/latest/embed/iframe-api/) script and TypeScript type definitions for the API.

## Installation

```shell
npm install --save @kinescope/player-iframe-api-loader
# or
yarn add @kinescope/player-iframe-api-loader
```

The package has ESM and CommonJS builds: both `import` and `require` work.

## Features

The loader replaces the standard way of loading the Iframe API with the `onKinescopeIframeAPIReady` callback.

The library also contains TypeScript type definitions. They can be used without the loader.

## Usage

```ts
import * as iframeApiLoader from '@kinescope/player-iframe-api-loader';

// Load the latest stable version.
const factory = await iframeApiLoader.load();
// Create the player. See the docs, the link is below.
const player = await factory.create('player-container', { url: 'https://kinescope.io/embed/...' });
```

`load()` adds the script once. Calls made while it is loading share one loading, and a loaded API is returned right away.

If an attempt fails, the loader retries it:

- a failed attempt is a network error, a timeout, or a script that loads but does not initialize the API;
- by default an attempt may take 15 seconds, and there are 2 retries with a 1 second pause.

When all attempts fail, the promise rejects with an `Error` whose `cause` is the last error. The next call starts over.

```ts
// A specific version or a script url.
await iframeApiLoader.load('v2.202.2');
await iframeApiLoader.load(new URL('https://player.kinescope.io/latest/iframe.player.js'));

// Timeout of one attempt, number of retries and the pause between them (ms).
await iframeApiLoader.load('latest', { timeout: 10_000, retries: 3, retryDelay: 2_000 });
```

Only one version of the API can be loaded on a page. Requesting another version rejects.

## Types only

```ts
import '@kinescope/player-iframe-api-loader/types';

let player: Kinescope.IframePlayer.Player | undefined;

const factory = window.Kinescope?.IframePlayer;
if (factory) {
  player = await factory.create(...);
}
```

Or with a triple-slash directive:

```ts
/// <reference types="@kinescope/player-iframe-api-loader" />
```

> [Player embedding docs](https://docs.kinescope.io/player/latest/embed/iframe-api/iframe-player-factory/#create)
