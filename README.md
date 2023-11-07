# Canvas embed
Embed your Canvas charts in your application.

## Background
The clients in this library allows you to embed the charts you've built in Canvas within your own application.

To access Canvas data from the frontend client your backend application must generate a token using your Canvas signing key.

This token can contain grants for specific scopes.

For example, you might build a chart showing events in your application over time. You could add a `company` scope to this chart allowing you to filter for events by company.

When generating an access token for one of your users, you would include a scope like `{ "company_id": "abc123" }`. Then when the user viewed the chart they would only have access to their company's events.

## Implementation

Using chart embeds requires adding code to the backend and frontend of your application.

Your backend needs to store a secret signing key from Canvas. 

This key is used to sign tokens for each of your users granting them access to their data in Canvas.

When Canvas receives this token we verify that it was signed with your key. We also use any scopes contained in the grant when evaluating their chart data requests.

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
This repo currently contains two clients:
- React [frontend client](https://github.com/canvas/embed/tree/main/react)
- Ruby [backend client](https://github.com/canvas/embed/tree/main/ruby)

Additionally, this repo contains two examples:

- A [React project](https://github.com/canvas/embed/tree/main/react/example) using the React component
- A [Rails project](https://github.com/canvas/embed/tree/main/react/example) using the Ruby gem

You can use these together to see how the end-to-end flow would work in your application.
