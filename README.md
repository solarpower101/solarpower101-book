# SolarPower101 Book

Public educational source content for SolarPower101 Academy.

This repository is the long-form content companion for the platform learn route at:

```txt
https://solarpower101.github.io/learn/
```

The platform can keep short product-facing lessons at `/learn/{slug}/`, while this repo owns deeper public chapters and exports reviewed public metadata for integration.

## Current Commands

```sh
npm run validate
npm run export:public-index
```

`npm run export:public-index` writes `src/data/lesson-index.json`.

## Integration Contract

Every public lesson has:

- matching `slug` frontmatter
- `access: free`
- `category`
- `summary`
- `last_verified_at`
- a stable platform URL: `https://solarpower101.github.io/learn/{slug}/`
- a book URL path: `/book/{slug}/`
