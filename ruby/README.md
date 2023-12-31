# Canvas::Embed

This Gem allows you to generate signed tokens that grant access to your Canvas embeds.

Your application frontend can then use these tokens in the Canvas [React component](https://github.com/canvas/embeds/tree/main/react) to display your Canvas embeds in your application.

Each token should be configured with the set of scopes that are approriate for the user, granting them access to only their data.

If any scopes are required by your charts that are not present in the scopes payload, the request will fail.

You can view how this Gem is used in a sample rails app in the `example/` directory

# Installation

Add `gem 'canvas-embed'` to your Gemfile then run `bundle install`

# Usage - chart embeds

```
# key is the private key from Canvas
# scopes is the Hash of scopes to grant the user
# expiration_seconds is the duration in seconds for the token to be valid (default is one hour)
# user_id is an optional user identifier that will be used in Canvas' logging
Canvas::Embed.generate_embed_token(key, scopes, expiration_seconds, user_id)
```

# Usage - sign in

```
# key is the private key from Canvas
# scopes is the Hash of scopes to grant the user
# expiration_seconds is the duration in seconds for the token to be valid (default is 30 minutes)
# user_id is an optional user identifier that will be used in Canvas' logging
# first_name is optional to add the user's first name in Canvas
# last_name is optional to add the user's last name in Canvas
Canvas::Embed.generate_login_token(key, email, expiration_seconds, user_id, first_name, last_name)
```

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