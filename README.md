# Candle Card — GitHub-backed admin

This Next.js demo uses the repository as its content store. The public page renders the committed [`data/site.json`](data/site.json); it does not use `localStorage` or a database.

## Required environment variables

Create `.env.local` for local development (use real values locally, never commit this file):

```env
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=your-strong-password
GITHUB_TOKEN=github-token-with-repository-contents-write-access
GITHUB_OWNER=your-github-owner
GITHUB_REPO=your-repository-name
GITHUB_BRANCH=main

# Optional; defaults to data/site.json
GITHUB_SITE_DATA_PATH=data/site.json
```

`GITHUB_TOKEN` must be able to read repository contents and create commits/update the configured branch. For a fine-grained personal access token, grant access only to this repository and use the minimum required Contents read/write permission. Branch protection rules must allow the token identity to update the target branch.

Run locally:

```bash
npm install
npm run dev
```

Open `http://localhost:3000/admin` and sign in.

## Vercel setup

In **Vercel → Project → Settings → Environment Variables**, add all required variables above for the environments that need the admin (normally Production, and optionally Preview/Development). Redeploy after changing environment variables.

Connect the Vercel project to the same GitHub repository and branch. A commit pushed by the admin will then trigger the normal Vercel Git deployment once.

## Save flow

1. The authenticated admin loads the latest `data/site.json` and its Git blob SHA from GitHub through the server API.
2. Every form edit stays only in React draft state. Input changes, blur events, image-path edits, and discard actions make no GitHub calls.
3. **Save changes** sends the complete desired model and the loaded blob SHA to `POST /api/admin/save`.
4. The server revalidates the session and complete model, then checks that the GitHub blob SHA is still current.
5. The Git Data API creates a blob, one tree, one commit, and updates the branch ref once.

Therefore, **one Save creates one Git commit**, containing the complete content update, and triggers at most one Vercel deployment. If another commit changed the content first, the API returns `409 Conflict`; refresh the editor before retrying so newer work is not overwritten.

The current demo edits existing image paths/URLs; it does not provide file uploads. If uploads are added later, their blobs must be included in the same Git tree and commit rather than using repeated Contents API updates.

## Security

- Authentication and GitHub authorization are independently checked by server routes using an `HttpOnly`, `SameSite=Strict` session cookie.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and all GitHub configuration are server-only. Never prefix secrets with `NEXT_PUBLIC_`.
- Never put a GitHub token in browser code, log it, commit `.env.local`, or commit any token/password to Git.
- Rotate a credential immediately if it is accidentally exposed.
