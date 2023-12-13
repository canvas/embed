# Canvas embed

React library for displaying charts from Canvas in your own application. Requires a grant token generated from one of our backend clients.

# Usage

```
import { Chart } from "canvas-embed";
import "canvas-embed/dist/index.css";

<Chart
  chartId={embedId} // From a chart you built in Canvas
  authToken={token} // Generated from your backend application using one of our clients
  disableExport={true} // Set if you want a dropdown allowing the chart to be downloaded
  timezone={null} // Set if you want date times to be adjusted to a timezone
/>
```

# Internal - Publishing

```
yarn version --patch
npm run build
npm publish
```

```
yarn version --patch; npm run build; cp lib-esm/index.d.ts dist
```