# Canvas embed React library

React library for displaying charts from Canvas in your own application. Requires a grant token generated from one of our backend clients.

## Installation

```
npm install canvas-embed
```

## Usage

```
import { Canvas } from "canvas-embed";

<Canvas
  canvasId={canvasId}
  authToken={AUTH_TOKEN}
/>
```

You can find instructions for obtaining the `AUTH_TOKEN` [here](https://canvasapp.com/docs/building-canvases/embeds)
