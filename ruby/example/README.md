# Example Rails app

This simple Rails app demonstrates how you would use the canvas-embeds Gem to generate a token granting access to Canvas embeds for one of your users.

The signing key is expected to be in the CANVAS_SIGNING_KEY variable.

After running `bundle install` you can start the Rails server with

```
CANVAS_SIGNING_KEY=[your signing key] bin/rails server
```

This serves a GET endpoint `generate_token?scopes=[scopes]` where scopes are the scopes you want included in the generated token.


This endpoint is used in the [React component](https://github.com/canvas/embeds/tree/main/react) to view embedded Canvas charts as they will appear to your users.

In order for this to work, you'll need to update the scopes in `ApplicationController` to include the ones relevant to your charts and user.

# Running

```
bin/rails server
```

This application expects the key in the CANVAS_SIGNING_KEY variable. You can set this by running:

```
CANVAS_SIGNING_KEY=emk_HgwRqhyt.f0533f95ed220910218667124cac2116fsse11daf2aa1ff9938f7fde7a16c203 bin/rails server
```