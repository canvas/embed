import { generateToken } from "canvas-embed-node";

// Sample values, adjust to taste
const scopes = { team_id: "79" };
const expiration = 600000;
const key =
  "emk_eZVPZSAl.16933eebf7f9zbqd6p45612165a9246c26a5d7d82e5a48d652496bcm834o836b";

async function run() {
  const token = await generateToken(scopes, expiration, key);
  console.log("token", token);
}

run();
