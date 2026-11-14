# Contributing

## Development

Prerequisites: [Bun](https://bun.sh) 1.3.14 (the `packageManager` version in `package.json`).

```bash
bun install
cp apps/web/.env.example apps/web/.env.local
bun run dev
```

`bun run dev` starts the web app and watches the CLI. Run `bun run check` before opening a PR. It runs lint, typecheck, and tests. CI runs the same steps, then builds the CLI. `bun run format` fixes formatting.

## Environment variables

`apps/web` validates its environment in `apps/web/lib/env.ts`. Set these in `apps/web/.env.local`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_DATABUDDY_CLIENT_ID` | Yes | Databuddy analytics client id |
| `UNKEY_API_KEY` | Yes | Bearer token the web app sends to its own `/api/og` route |
| `UNKEY_ROOT_KEY` | Yes | Unkey root key that verifies keys on the `/api/*` and MCP routes, must start with `unkey_` |
| `UPSTASH_REDIS_REST_URL` | No | Shared rate limit and report store |
| `UPSTASH_REDIS_REST_TOKEN` | No | Without the Upstash pair, dev uses in-memory stores |

## Changesets

Run `bun run changeset` when a change affects the published `og-tester` CLI, and commit the generated file with your PR.
