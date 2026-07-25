# Digital Footprint build notes

This repo has been patched for the build blockers found in the uploaded zip.

## Fixed

- `package.json` now matches the resolved lockfile dependency versions.
- Removed `next/font/google` from `app/layout.tsx` so the build does not fail when Google Fonts cannot be reached.
- Added static generation tuning in `next.config.ts` for local VM builds.
- Updated Next.js 15 dynamic route pages so `params` are awaited correctly.
- Fixed CDD section Framer Motion variant typing.
- Fixed Supabase `err` / `error` response handling on the new UAT project page.
- Fixed Supabase `count` handling on the UAT tester profile page.

## Run locally

```bash
npm ci
npm run build
```

## Notes

The previous sandbox could not clone GitHub directly because DNS for `github.com` was unavailable, so the repo was patched through the GitHub connector/API.
