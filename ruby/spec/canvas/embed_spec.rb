# frozen_string_literal: true

# require 'rails_helper'
require 'rbnacl'
require 'canvas/embed'

RSpec.describe Canvas::Embed do
  subject do
    self.extend(Canvas::Embed)
  end

  it 'has a version number' do
    expect(Canvas::Embed::VERSION).not_to be nil
  end

  it 'generates valid encrypted token' do
    key = RbNaCl::Random.random_bytes(RbNaCl::SecretBox.key_bytes)
    unpacked_key = "emk_ZRzQbE9d.#{key.unpack1('H*')}"

    original_message = { 'team' => 'canvas' }

    token = Canvas::Embed.generate_token(unpacked_key, original_message)
    expect(token).not_to be nil

    decoded = JSON.parse(Base64.decode64(token))

    expect(decoded['keyId']).to eq('emk_ZRzQbE9d')

    message_hex = decoded['message']
    nonce_hex = decoded['nonce']
    nonce = [nonce_hex].pack('H*')
    message = [message_hex].pack('H*')

    secret_box = RbNaCl::SecretBox.new(key)
    decrypted_message = secret_box.decrypt(nonce, message)
    context = JSON.parse(decrypted_message)

    expect(context['scopes']['team']).to eq('canvas')
    expect(context['exp']).to eq(Time.now.to_i + 3600)
    expect(context['userId']).to eq(nil)
  end

  it 'rejects non-hash' do
    key = RbNaCl::Random.random_bytes(RbNaCl::SecretBox.key_bytes)
    unpacked_key = "emk_ZRzQbE9d.#{key.unpack1('H*')}"
    original_message = "'team': 'canvas'"
    expect { Canvas::Embed.generate_token(unpacked_key, original_message) }.to raise_error(Canvas::InvalidScopeError)
  end

  it 'accepts custom expiration and userId' do
    key = RbNaCl::Random.random_bytes(RbNaCl::SecretBox.key_bytes)
    unpacked_key = "emk_ZRzQbE9d.#{key.unpack1('H*')}"
    original_message = { 'team' => 'canvas' }
    token = Canvas::Embed.generate_token(unpacked_key, original_message, 7200, "cus_abc123")
    expect(token).not_to be nil
    decoded = JSON.parse(Base64.decode64(token))
    expect(decoded['keyId']).to eq('emk_ZRzQbE9d')

    message_hex = decoded['message']
    nonce_hex = decoded['nonce']
    nonce = [nonce_hex].pack('H*')
    message = [message_hex].pack('H*')

    secret_box = RbNaCl::SecretBox.new(key)
    decrypted_message = secret_box.decrypt(nonce, message)
    context = JSON.parse(decrypted_message)

    expect(context['exp']).to eq(Time.now.to_i + 7200)
    expect(context['userId']).to eq("cus_abc123")
  end
end
