# frozen_string_literal: true

require 'canvas/embed'

RSpec.describe Canvas::Embed do
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
  end
end
