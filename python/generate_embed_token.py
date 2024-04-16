import json
import time
import base64
from nacl import utils, secret
from nacl.secret import SecretBox
from base64 import b64encode

class InvalidScopeError(Exception):
    pass

def generate_embed_token(private_key, scopes, expiration_seconds=3600, user_id=None):
    if not isinstance(scopes, dict):
        raise InvalidScopeError(f"Invalid scope {scopes} type {type(scopes)}")

    key_id, key_hex = private_key.split(".")
    key_bytes = bytes.fromhex(key_hex)

    # Create a random nonce
    nonce = utils.random(secret.SecretBox.NONCE_SIZE)

    # Create the message
    message = { "scopes": scopes, "exp": time.time() + expiration_seconds }

    # Create SecretBox with the given key
    box = secret.SecretBox(key_bytes)

    # Encrypt the message
    encrypted_message = box.encrypt(bytes(json.dumps(message).encode('utf-8')), nonce)

    # Convert encrypted message and nonce to Hex
    encrypted_message_hex = encrypted_message.ciphertext.hex()
    nonce_hex = nonce.hex()

    # Prepare token to be returned
    token = { "message": encrypted_message_hex, "nonce": nonce_hex, "keyId": key_id }

    # Encode the token to Base64 before returning
    return b64encode(json.dumps(token).encode()).decode()

print('---') 
print(generate_embed_token('emk_...', { "team_id": "123" }, 60000))
print('---')