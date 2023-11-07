# Uses your signing key from Canvas to generate a token granting access to scoped Canvas data

require_relative 'embed/version'
require 'json'
require 'rbnacl'
require 'base64'

module Canvas
  module Embed
    module_function

    def generate_token(private_key, scopes)
      # token consists of an id and the signing key
      key_id, key = private_key.split('.')
      # transform signing key hex into bytes
      key_bytes = [key].pack('H*')
      secret_box = RbNaCl::SecretBox.new(key_bytes)
      nonce = RbNaCl::Random.random_bytes(secret_box.nonce_bytes)
      message = { 'scopes' => scopes }.to_json
      ciphertext = secret_box.encrypt(nonce, message)
      # transform bytes into hex
      unpacked_message = ciphertext.unpack1('H*')
      unpacked_nonce = nonce.unpack1('H*')
      token = { 'message' => unpacked_message, 'nonce' => unpacked_nonce, 'keyId' => key_id }.to_json
      # strict for no newlines
      Base64.strict_encode64(token)
    end
  end
end
