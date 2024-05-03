<?php
namespace Canvas;

require 'vendor/autoload.php';


use ParagonIE_Sodium_Compat as Sodium;
use Base64Url\Base64Url;


class InvalidScopeError extends \Exception {}

function generateEmbedToken($key, $scopes, $expiration) {
    $keyParts = explode(".", $key);
    $keyId = $keyParts[0];
    $keyHex = $keyParts[1];
    $keyBytes = Sodium::hex2bin($keyHex);
    # Create a random nonce
    $nonce = random_bytes(Sodium::CRYPTO_SECRETBOX_NONCEBYTES);
    $expirationDate = time() + $expiration;
    # Create the message
    $message = json_encode(['scopes' => $scopes, 'exp' => $expirationDate], JSON_FORCE_OBJECT);
    # Encrypt the message
    $encryptedMessage = Sodium::crypto_secretbox($message, $nonce, $keyBytes);
    # Convert encrypted message and nonce to Hex
    $encryptedMessageHex = Sodium::bin2hex($encryptedMessage);
    $nonceHex = Sodium::bin2hex($nonce);
    # Prepare token to be returned
    $token = json_encode(['message' => $encryptedMessageHex, 'nonce' => $nonceHex, 'keyId' => $keyId]);
    # Encode the token to Base64 before returning
    return rtrim(strtr(base64_encode($token), '+/', '-_'), '=');
}


?>