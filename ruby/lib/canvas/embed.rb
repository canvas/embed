# Uses your signing key from Canvas to generate a token granting access to scoped Canvas data

require_relative 'embed/version'
require 'json'
require 'rbnacl'
require 'base64'

module Canvas
  class InvalidScopeError < StandardError 
  end
  module Embed
    module_function 
    # Public: Generate a token granting access to a scoped set of your data in Canvas
    #
    # private_key - String, signing key obtained from Canvas
    # scopes - Hash, containing the scopes to grant for this token
    # expiration_seconds - Optional Integer, how long the token should be valid for
    # user_id - Optional String, identifier for the user, used in logging in Canvas.
    #
    def generate_embed_token(private_key, scopes, expiration_seconds = 3600, user_id = nil)
      if !scopes.is_a?(Hash)
        raise InvalidScopeError.new("Invalid scope #{scopes} type #{scopes.class}")
      end
      # token consists of an id and the signing key
      key_id, key = private_key.split('.')
      # transform signing key hex into bytes
      key_bytes = [key].pack('H*')
      secret_box = RbNaCl::SecretBox.new(key_bytes)
      nonce = RbNaCl::Random.random_bytes(secret_box.nonce_bytes)
      exp = Time.now.to_i + expiration_seconds
      message = { 'scopes' => scopes, 'exp' => exp }
      if user_id != nil
        message['userId'] = user_id
      end
      ciphertext = secret_box.encrypt(nonce, message.to_json)
      # transform bytes into hex
      unpacked_message = ciphertext.unpack1('H*')
      unpacked_nonce = nonce.unpack1('H*')
      token = { 'message' => unpacked_message, 'nonce' => unpacked_nonce, 'keyId' => key_id }.to_json
      # strict for no newlines
      Base64.strict_encode64(token)
    end

    # Public: Generate a token allowing one of your users to login to your account or sub-account
    #
    # private_key - String, signing key obtained from Canvas
    # email - String, the email of the user to login. This should match a user or invite in one of your accounts.
    # expiration_seconds - Optional Integer, how long the token should be valid for. Default to 10 minutes.
    # user_id - Optional String, identifier for the user, used in logging in Canvas.
    #
    def generate_login_token(private_key, email, expiration_seconds = 600, user_id = nil)
      # token consists of an id and the signing key
      key_id, key = private_key.split('.')
      # transform signing key hex into bytes
      key_bytes = [key].pack('H*')
      secret_box = RbNaCl::SecretBox.new(key_bytes)
      nonce = RbNaCl::Random.random_bytes(secret_box.nonce_bytes)
      exp = Time.now.to_i + expiration_seconds
      message = { 'email' => email, 'exp' => exp }
      if user_id != nil
        message['userId'] = user_id
      end
      ciphertext = secret_box.encrypt(nonce, message.to_json)
      # transform bytes into hex
      unpacked_message = ciphertext.unpack1('H*')
      unpacked_nonce = nonce.unpack1('H*')
      token = { 'message' => unpacked_message, 'nonce' => unpacked_nonce, 'keyId' => key_id }.to_json
      # strict for no newlines
      Base64.strict_encode64(token)
    end
  end
end
