FROM jekyll/jekyll:4.2.2

# Ruby 3 no longer bundles WEBrick, but Jekyll 4.2 still uses it for `serve`.
RUN gem install webrick --version 1.8.2 --no-document
