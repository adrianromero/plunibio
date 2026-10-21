# Plunibio website

The project website is a bilingual Jekyll site published with GitHub Pages.

## Preview with Docker

You only need Docker; Ruby, Bundler, Jekyll, and WEBrick do not need to be
installed on the host system.

Build the local development image once from the repository root:

```bash
docker build \
  --tag plunibio-jekyll \
  --file website/Dockerfile \
  .
```

Then start the preview server:

```bash
docker run --rm -it \
  -p 4000:4000 \
  -v "$PWD:/srv/jekyll" \
  -w /srv/jekyll \
  plunibio-jekyll \
  jekyll serve \
    --source website \
    --destination /tmp/plunibio-site \
    --host 0.0.0.0 \
    --force_polling \
    --disable-disk-cache
```

Open <http://localhost:4000/plunibio/>. Jekyll watches the files under
`website/` and rebuilds the site when they change. Stop the server with
`Ctrl+C`.

Rebuild the image only when `website/Dockerfile` changes.

## Build with Docker

To verify that the site builds without starting a server, run from the
repository root:

```bash
docker run --rm \
  -v "$PWD:/srv/jekyll" \
  -w /srv/jekyll \
  plunibio-jekyll \
  jekyll build \
    --source website \
    --destination /tmp/plunibio-site
```

## Content

English pages live in `en/` and Spanish pages in `es/`. Pages that are translations
of each other share the same `translation_key` in their front matter.
