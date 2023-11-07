# frozen_string_literal: true

require_relative 'lib/canvas/embed/version'
require 'rake/file_list'

Gem::Specification.new do |spec|
  spec.name = 'canvas-embed'
  spec.version = Canvas::Embed::VERSION
  spec.authors = ['Will Pride']
  spec.email = ['will@canvasapp.com']

  spec.summary = 'Generate tokens to display your Canvas charts in your application.'
  spec.description = "This Gem allows you to generated signed tokens that grant your users scoped access to your Canvas embeds. This token can be used in Canvas' React component to display your Canvas charts in your own application."
  spec.homepage = 'https://github.com/canvas/embeds'
  spec.license = 'MIT'
  spec.required_ruby_version = '>= 2.6.0'

  spec.metadata['homepage_uri'] = 'https://canvasapp.com'
  spec.metadata['source_code_uri'] = 'https://github.com/canvas/embeds'
  spec.metadata['bug_tracker_uri'] = 'https://github.com/canvas/embeds/issues'

  spec.files = Rake::FileList['**/*'].exclude(*File.read('.gitignore').split)
  spec.require_paths = ['lib']

  spec.add_dependency 'rbnacl', '~> 7.1.1'

  spec.add_development_dependency 'rspec', '~> 3.0'
  spec.add_development_dependency 'rubocop', '~> 1.21'
end
