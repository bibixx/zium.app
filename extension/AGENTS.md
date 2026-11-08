# Companion extension

The Chrome extension that gives the page authenticated access to F1 TV. It's a separate Yarn project with its own lockfile, so run its commands from this folder.

```bash
yarn dev    # Watch build; load extension/dist unpacked
yarn build  # Type-check and production build
```

## Files

| File | Role |
|---|---|
| `extension/src/background.ts` | Service worker: cookie watching, header rules, alarms |
| `extension/src/content-script-zium.ts` | Bridge between the page and the worker |
| `extension/src/utils/parseLoginSession.ts` | Reads the token from the login cookie |
| `extension/public/rules.json` | Static CORS rules |
| `extension/vite.plugins.ts` | Injects domains into the manifest and rules; zips builds |

The page side is `src/utils/extensionApi.ts`.

## How auth works

There's no OAuth flow and no proxy. The worker watches the formula1.com `login-session` cookie, parses the token, and installs `declarativeNetRequest` rules that add the auth header to F1 TV requests. Credentials stay on the device. The page never handles the token for requests.

## Rules

- The store version can lag behind the web app, so new fields read by the page stay optional.
- Header rules are dynamic and must be re-applied when the worker restarts.
- The `chrome` global is banned by ESLint in the web app. Keep extension APIs here and go through `src/utils/extensionApi.ts`.

## Known gaps

See the Extension section of [known issues](../docs/known-issues.md#extension).
