# frozen_string_literal: true

# require "canvas-embed"

class ApplicationController < ActionController::Base
  def generate_token
    # this is the secret signing key from Canvas
    key_hex = ENV['CANVAS_SIGNING_KEY']
    # this should be updated to include the scopes needed for your charts and that are
    # appropriate for the user
    begin
      scopes = ActiveSupport::JSON.decode params[:scopes]
    rescue StandardError
      return render json: { 'message' => 'Scopes were not valid JSON' }, status: 500
    end
    token = Canvas::Embed.generate_token(key_hex, scopes)
    render json: { 'token' => token }
  end
end
