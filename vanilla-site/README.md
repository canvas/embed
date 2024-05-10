# Non-React and npm client

This page demonstrates how you can use Canvas embeds in a project that does not use React or npm.

Instead this pulls the bundle directly from our CDN. We also pull React and ReactDOM as peer dependencies. If you already have React and ReactDOM you do not need to add them again.

We also use [@babel/standalone](https://babeljs.io/docs/babel-standalone) so that we can use JSX in the browser.

## Usage

This example expects canvas_id and auth_token as URL parameters. You can generate the auth_token using one of our backend packages. You get the canvas ID from the URL of the canvas you want to embed. Once you have this, just navigate to:

`embed/vanilla-site/index.html?canvas_id=[your_canvas_id]&auth_token=[your_auth_token]`
