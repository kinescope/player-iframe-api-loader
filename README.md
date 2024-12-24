# Kinescope Player Iframe API Loader

[![npm package](https://img.shields.io/npm/v/@kinescope/player-iframe-api-loader.svg?style=flat-square)](https://www.npmjs.org/package/@kinescope/player-iframe-api-loader)

A simple loader of JavaScript files ([Iframe API](https://docs.kinescope.io/player/latest/)) and TypeScript types who uses Kinescope Player Iframe API.

## Installation

```shell
npm install --save @kinescope/player-iframe-api-loader
# or
yarn add @kinescope/player-iframe-api-loader
```

## Features

The loader replaces standard way of loading and usage Iframe API such as `onKinescopeIframeAPIReady` callback.

Also the library contains TypeScript type definitions. It is possible to use only TypeScript types without loader.

Example:

```ts
import * as iframeApiLoader from '@kinescope/player-iframe-api-loader';

// Load the latest stable version.
const factory = await iframeApiLoader.load();
// Create the player. Look at the docs, the link below.
const player = await factory.create(...);

```

Using only types:

```ts
import '@kinescope/player-iframe-api-loader/types';

let player: Kinescope.IframePlayer.Player | undefined;

const factory = window.Kinescope?.IframePlayer;
if (factory) {
  player = await factory.create(...);
}

```

> [Player embedding docs](https://docs.kinescope.io/player/latest/iframe/IframePlayerFactory.html#create)
