# Canvas embed
Embed your Canvas charts in your application.

## Background
The clients in this library allows you to embed your canvases within your own application. This requires adding code to both your frontend and backend applications.

On the frontend you can either: 

- Install the React client under `/react` using `npm install canvas-embed` and following the example under `/example`
- Use the scripts from our CDN following the example under `/vanilla-site`

Using the frontend client requires generating an authentication token that you can safely send to your users' browser. You generate this authentication token using a secret Embed Key from Canvas with one of the backend clients (`/canvas-embed-node`, `/php`, `/python`, or `/ruby`).

This authentication can optionally include [scopes](https://canvasapp.gitbook.io/docs/embeds/scopes). Scopes give a user access to only a certain slice of the data depending on how you configure your canvas. If all of your users should see the same data for a given canvas then you can leave the scopes empty.

## Implementation

Using embeds requires adding code to the backend and frontend of your application.

Your backend needs to store a secret signing key from Canvas. 

This key is used to sign tokens for each of your users granting them access to their data in Canvas.

When Canvas receives this token we verify that it was signed with your key. We also use any scopes contained in the grant when evaluating their data requests.

The React component in this library uses this token to request the user's data and then display the chart.

## Request flow
The successful flow has the following steps:

1. A user authenticated into your application accesses a page with one or more Canvas embeds
2. Your frontend sends a request to your backend asking for a token granting access to that users' data in Canvas
3. Your backend authenticates that user and gathers the correct scopes for that user to access their data in Canvas
4. Your backend generates a token with those scopes, encrypted uses the secret signing key from Canvas
5. Your frontend code passes that token to the Canvas React component 
6. This component uses that token to call the Canvas backend requesting the chart data
7. Canvas verifies the token was signed with the correct key. If valid, Canvas returns the chart data granted by those scopes
8. The Canvas React component displays that data

## Clients
This repo currently contains four backend clients:
- Ruby [backend client](https://github.com/canvas/embed/tree/main/ruby)
- Python [backend client](https://github.com/canvas/embed/tree/main/python)
- NodeJS [backend client](https://github.com/canvas/embed/tree/main/canvas-embed-node)
- PHP [backend client](https://github.com/canvas/embed/tree/main/php)
  
And one frontend client:
- [React](https://github.com/canvas/embed/tree/main/react)
  
Additionally, this repo shows how to use the frontend client without npm or React:
- [browser](https://github.com/canvas/embed/tree/main/vanilla-site)

  
You can use these together to see how the end-to-end flow would work in your application.
