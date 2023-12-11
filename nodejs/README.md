# NodeJS

To generate Canvas authentication tokens from NodeJS you can use the following snippet:

```
    async generateToken(scopes: Record<string, string>, exp: number, key: string): Promise<string> {
        await _sodium.ready;
        const sodium = _sodium;
        const [keyId, keyHex] = key.split('.');
        const keyBytes = Uint8Array.from(Buffer.from(keyHex, 'hex'));
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const message = { scopes: scopes, exp };
        const encryptedMessage = sodium.crypto_secretbox_easy(JSON.stringify(message), nonce, keyBytes);
        const encryptedMessageHex = Buffer.from(encryptedMessage).toString('hex');
        const nonceHex = Buffer.from(nonce).toString('hex');
        const token = { message: encryptedMessageHex, nonce: nonceHex, keyId };
        return btoa(JSON.stringify(token));
    }
```

`key` here is the secret key you generated in Canvas.

This snippet requires that you have [`libsodium`](https://libsodium.gitbook.io/doc/) installed for encryption.