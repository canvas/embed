# Canvas::Embed

This Gem allows you to generate signed tokens that grant access to your Canvas embeds.

Your application frontend can then use these tokens in the Canvas [React component](https://github.com/canvas/embeds/tree/main/react) to display your Canvas embeds in your application.

Each token should be configured with the set of scopes that are approriate for the user, granting them access to only their data.

If any scopes are required by your charts that are not present in the scopes payload, the request will fail.

You can view how this Gem is used in a sample rails app in the `example/` directory

# Running tests

```
rspec
```

# Canvas publishing

```
# increment the version in version.rb
# build the new gem
rake build
# outputs new gem path eg 'canvas-embed 0.1.1 built to pkg/canvas-embed-0.1.1.gem'
# publish the new gem (need rubygems.org access) from the path above
gem push pkg/canvas-embed-0.1.1.gem
```