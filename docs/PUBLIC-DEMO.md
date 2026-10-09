# Public demo deployment

This edition can run without Supabase, Anthropic, Resend or Upstash credentials.

## Vercel dashboard
1. Import https://github.com/huyle-droid/grittruth into your Vercel account.
2. Use the Next.js preset, the repository root, Node.js 22.x, install command `npm ci`, build command `npm run build`, and the default output directory.
3. Leave all external-service keys unset.
4. Set `NEXT_PUBLIC_SITE_URL` to the canonical public URL, with no trailing slash. Use the assigned production vercel.app URL until your custom domain is connected. Redeploy after changing it.
5. Deploy and visit `/workspace?demo=1`. Test editing Brand DNA, saving a sample draft, creating a campaign and exporting text.
6. If Deployment Protection requires visitors to sign in, configure the production domain for public access before sharing it with reviewers. Check in an incognito browser.
7. Add grittruth.com in Vercel Project Settings → Domains when ready, apply the DNS records shown by Vercel, then set `NEXT_PUBLIC_SITE_URL=https://grittruth.com` and redeploy.

## What reviewers can actually try
- All public pages.
- Brand DNA, sample templates, editable drafts, campaigns and text exports.
- Browser-local persistence; no account is required.

Claude generation, account sign-in, cloud storage and contact-form delivery are not connected in this demo. The interface states this explicitly. The email link points to contact@grittruth.com; mailbox setup remains an owner task.

For updates, commit changes and push to main. Vercel can rebuild automatically once its GitHub integration is connected. See [Vercel Git deployments](https://vercel.com/docs/git/vercel-for-github).
