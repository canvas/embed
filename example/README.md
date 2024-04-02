# Canvas Embed

This sample application demonstrates how to use Canvas embeds in your application.

Using this requires:

1. Creating a canvas that you've set as embeddable
2. Getting an embed key from canvasapp.com/team_settings
3. Using that embed key to generate an AUTH_TOKEN with the correct grants for your canvas

# Basic run steps

1. Go to canvasapp.com/team_settings and generate an embed key.
2. Create a canvas that you want to embed; use Cmd + K -> "Embed Canvas" to open the save dialog. Note any variables that you marked as scoped. These must be set in the next step.
3. Open `python/generate_embed_token.py` and edit the last line with your embed key and a dict containing any scopes from above. Run with `python3 python/generate_embed_token.py` and note that output. You may need to use setup a `venv` and run `pip install` (shudder)
4. Go to `/example`and run `npm run dev`
5. The example page should automatically open. Enter the Canvas ID and output from `generate_embed_token` into the two fields.

```
npm i
npm run dev
```

## Local development with React repo

Most straightforward steps:

1. Go to canvasapp.com/team_settings and generate an embed key.
2. Create a canvas that you want to embed; use Cmd + K -> "Embed Canvas" to open the save dialog. Note any scopes that you required.
3. Open `python/generate_embed_token.py` and edit the last line with your embed key and a dict containing any scopes from above. Run with `python3 python/generate_embed_token.py` and note that output. You may need to use setup a `venv` and run `pip install` (shudder)
4. Go to `/example` and run `npm link ../react`. This creates a symlink that will pull this dependency from your local
5. Go to `/react` and run `npm run dev`; `npm link` looks for the built output in `dist` so this needs to run and remain running to pick up any changes in react
6. In a new tab go to `/example`. If you want to point to your local Canvas server, follow the instructions in `config/.env.example` to set the `HOST` env variable.
7. Run `npm run dev` from `/example`
8. The example page should automatically open. Enter the Canvas ID and output from `generate_embed_token` into the two fields.

To unlink the local install run `npm uninstall --no-save canvas-embed && npm install`
