# Deployment

The current request is to test the production build **locally**. This is a static Vite application; there is no backend, database, secret or environment variable to provision. No remote deployment has been made in this build session. Vercel remains the future hosting target.

## Local production testing

```sh
npm run build
node scripts/serve-local-production.mjs
```

Open **http://localhost:4173/**. The preview serves the optimized dist build with production code splitting and developer tools removed. It calls Vite's API directly to bypass the installed Console Ninja editor hook on Vite's CLI. All 20 served production files were compared byte-for-byte with dist. Keep the terminal running while testing. Development review pages and before/after evidence are available through the development server on port 5174.

Saved progress is specific to each origin: localhost:4173 has its own save, separate from localhost:5174 and 127.0.0.1. Automated verification uses isolated browser contexts and does not modify the owner's browser profile. Hardware performance should be assessed in the owner's regular browser.

## Vercel

Use Node **24.x**, matching package.json and the tested local Node 24 runtime. Vercel currently supports this major version; see [official supported Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

Run locally:

~~~sh
npm install
npm run build
npm run preview
~~~

Import the Git repository in Vercel, choose its root as the project directory and the **Vite** framework. The checked-in vercel.json specifies **npm ci**, **npm run build**, **dist**, the SPA index fallback and cache headers for hashed assets. No environment variables are required. Use a preview deployment to check loading, audio after a gesture, memory viewing/hanging, journals, language, reset and portrait controls before assigning the production domain. The rewrite follows [Vercel's Vite SPA guidance](https://vercel.com/docs/frameworks/frontend/vite).

If using the CLI after signing in, run **vercel** from the project root for a preview. Review the selected team/project and preview; **vercel --prod** publishes production. Those commands are owner steps, not commands already executed here. Do not commit login tokens.

.vercelignore omits local screenshots, test reports and dependency/build folders from CLI uploads. Vercel's build still includes src, package-lock.json, configs and public assets. Generated geometry needs no external files. The music and font files in public/bundled dependencies are copied into dist. Keep personalized photos under public/photos and use /photos/name.jpg. HTTPS remote images/recordings need cross-origin access; failed content uses a local visual/music fallback.

Saved progress belongs to a browser origin. A localhost save does not move to a Vercel domain; preview domains and production domains also have separate saves. Deployment does not migrate data between devices or origins. There is no server-side family-data store.

Local preview verifies built files and frontend behavior. It cannot establish Vercel CDN headers or a live domain's behavior; check those after deployment. Test an actual iOS/Android device for touch/audio and accelerated graphics.

## Netlify alternative

If choosing Netlify later, use Node 24, build command **npm run build**, publish directory **dist**. These build/output settings follow [Netlify's Vite guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/). For SPA paths, add a Netlify-only public/_redirects file containing:

~~~text
/* /index.html 200
~~~

Keep Vercel as the current target. No Netlify project or deployment was created.
