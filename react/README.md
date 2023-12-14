# Canvas embed React library

## Installation

```
npm install canvas-embed
```

React library for displaying charts from Canvas in your own application. Requires a grant token generated from one of our backend clients.

## Usage

```
import { Chart } from "canvas-embed";

<Chart
  chartId={embedId} // From a chart you built in Canvas
  authToken={token} // Generated from your backend application using one of our clients
  disableExport={true} // Set if you want a dropdown allowing the chart to be downloaded
  timezone={null} // Set if you want date times to be adjusted to a timezone
/>
```

### Internal

#### development

Copy over Rust types from main repo with (adjust relative path in script as necessary):

```
npm run copy-rust-types
```

#### Publishing

```
npm version patch
npm run build
npm run publish --access public
```