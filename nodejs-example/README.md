# Canvas Embed Key Generation Node.js example

The following demonstrates an example of using the `canvas-embed-node` npm library to generate a Canvas Embed key in Node.js.

```
npm install canvas-embed-node
```

A sample source file is in `index.js`

```
import { generateToken } from "canvas-embed-node";

// Sample values, adjust to taste
const scopes = { team_id: "79" };
const expiration = Date.now() / 1000 + 6000;
const key =
  "emk_eZVPZSAl.16933eebf7f9zbqd6p45612165a9246c26a5d7d82e5a48d652496bcm834o836b";

async function run() {
  const token = await generateToken(scopes, expiration, key);
  console.log("token", token);
}

run();

```