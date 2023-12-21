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
const expiration = 60 * 60 * 24 * 7; // expiration time in seconds
const key =
  "emk_XYZabcDe.123456789ae9a932b1e12345a89abc54deed6549f51034b59478388c45c9e123"; // API key

async function run() {
  const token = await generateToken(scopes, expiration, key);
  console.log("token", token);
}

run();

```