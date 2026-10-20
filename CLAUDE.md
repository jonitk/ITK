# Working on inthekitchen.is

Jon Itkin's site. Jon is non-technical: he describes changes in plain English
and expects them done, previewed, and explained without jargon.

Read README.md for where everything lives.

## Workflow

- Never push straight to `main` for anything beyond a trivial fix. Branch,
  push, open a PR (REST API: `gh api -X POST repos/jonitk/ITK/pulls`; GraphQL
  is unavailable), let Netlify build the preview
  (`https://deploy-preview-<n>--scintillating-crisp-dcdcec.netlify.app`), check
  it in the browser, then merge.
- The "Build check" workflow saves each branch's built site to
  `builds/<branch>`. Clone that branch to inspect or diff built HTML when
  npm can't run locally.
- Keep the visual design exactly as it is unless Jon asks for a change.
  Verify layout-affecting edits against the previous build.

## Content rules

- Deep Reads are Markdown in `src/content/deep-reads/`. Keep Jon's wording and
  punctuation exactly; smartypants is off on purpose.
- `<h3 class="deep-read-spacer" aria-hidden="true">&zwj;</h3>` lines are
  deliberate vertical spacers carried over from Webflow.
- After adding or retitling a Deep Read, run `python3 scripts/og-images.py`
  and commit the new `public/og/*.png`.
- Booking link: TidyCal (`BOOKING_URL` in `src/lib/site.ts`). Don't use Calendly.
- Changing a URL means adding a 301 in `netlify.toml`.
- `/articles/category-leadership/` is a placeholder Jon is rewriting; it's
  `noindex` until he publishes it.
