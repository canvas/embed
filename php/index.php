<?php

require __DIR__ . '/vendor/autoload.php';

// Get this value from canvasapp.com/team_settings
$embed_key = getenv('CANVAS_EMBED_KEY');

if (!$embed_key) {
    echo "Please set the CANVAS_EMBED_KEY environment variable.";
    exit(1);
}

// Add any scopes you need like array("team_id" => "123")
$scopes = array();

// Sets token expiration time to 7 days
$valid_duration_seconds = 7 * 24 * 60 * 60;

$token = Canvas\generateEmbedToken($embed_key, array(), $valid_duration_seconds);

echo $token;