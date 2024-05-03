# PHP server

Simple PHP app demonstrating how to generate an authentication token for the embed frontend application.

This app expects your Canvas Embed Key to be under the CANVAS_EMBED_KEY environment variable.

## Usage

Update the scopes as needed in index.php, then run:

```
composer install
php -S localhost:8001
```

Navigate to localhost:8001 to view the authentication token
