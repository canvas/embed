import _sodium from "libsodium-wrappers";
import btoa from "btoa";

/**
 * Generate a token for Canvas embeds
 * @param scopes Scopes for the embed
 * @param exp Expiration date in seconds, UTC
 * @param key Embed API Key. Can be generated in Canvas by going to Settings -> Embed API
 * @returns {string} token
 */
export async function generateToken(
  scopes: Record<string, string>,
  exp: number,
  key: string
): Promise<string> {
  await _sodium.ready;
  const sodium = _sodium;
  const [keyId, keyHex] = key.split(".");
  const keyBytes = Uint8Array.from(Buffer.from(keyHex, "hex"));
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const message = { scopes, exp };
  const encryptedMessage = sodium.crypto_secretbox_easy(
    JSON.stringify(message),
    nonce,
    keyBytes
  );
  const encryptedMessageHex = Buffer.from(encryptedMessage).toString("hex");
  const nonceHex = Buffer.from(nonce).toString("hex");
  const token = { message: encryptedMessageHex, nonce: nonceHex, keyId };
  return btoa(JSON.stringify(token));
}
