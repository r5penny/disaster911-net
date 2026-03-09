# Dev Notes — disaster911.net Post-Deployment Checklist

> Prepared by Ryan Penny / Claude Code — last updated 2026-03-08
> Repo: https://github.com/Mattpenny51/disaster911

---

## Day 1 — Activate What's Already Built

These integrations are coded and live in the repo. They just need real credentials dropped in.

### GoHighLevel (GHL)
File: `script.js` (top of file — config constants)

```js
const GHL_WEBHOOK_URL    = 'YOUR_GHL_WEBHOOK_URL';       // ← replace
const GHL_LOCATION_ID    = 'YOUR_GHL_LOCATION_ID';       // ← replace
const GHL_CHAT_ENABLED   = false;                         // ← flip to true
const GHL_EXIT_INTENT_ENABLED = true;                     // already on
```

File: `contact/index.html` — find the calendar iframe:
```html
<iframe src="https://api.leadconnectorhq.com/widget/booking/YOUR_GHL_CALENDAR_ID_HERE" ...>
```
Replace `YOUR_GHL_CALENDAR_ID_HERE` with the real GHL calendar embed ID.

### Google Reviews
File: `google-reviews.js` (top of file)

```js
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';  // ← replace
const GOOGLE_PLACE_ID     = 'YOUR_GOOGLE_PLACE_ID_HERE';      // ← replace
```

- Enable **Maps JavaScript API** and **Places API** in Google Cloud Console
- Restrict the API key to the production domain (`disaster911.net`)
- Google Maps CID for reference: `14615414471722616873`

### Favicon
Missing entirely — causes 404 on every page load. Add:
- `/favicon.ico`
- `/favicon.svg` (preferred)
- Update `<head>` in all pages or add to a shared include

---

## Week 1 — Analytics & Tracking

- [ ] Install **Google Analytics 4** tag across all 226 pages
- [ ] Verify domain in **Google Search Console** → submit `/sitemap.xml`
- [ ] Connect **Google Business Profile** to the website
- [ ] Install **Microsoft Clarity** (free) for heatmaps and session recordings
- [ ] Set up **call tracking** (CallRail or similar) to identify which pages drive calls
- [ ] Test UTM parameter capture — confirm GHL is logging source/medium on all form submissions

---

## Month 1 — SEO & Local Authority

- [ ] **Backlinks** — submit to IICRC directory, BBB, Angi, HomeAdvisor, Yelp, local chamber
- [ ] **Google Business Profile posts** — weekly posts with real job photos
- [ ] **Citation audit** — NAP (Name/Address/Phone) must match exactly across all directories:
  - Name: `Disaster Response by Ryan`
  - Address: `3707 Northridge Dr NW STE 10, Walker, MI 49544`
  - Phone: `(616) 822-1978`
- [ ] **Core Web Vitals** — run PageSpeed Insights on homepage and top city pages, fix LCP/CLS/INP
- [ ] **WebP conversion** — convert all JPGs in `/images/` to WebP for faster load times
- [ ] **Minify** `styles.css` and `script.js` for production
- [ ] **Blog pages** — `llms.txt` and schema reference 10 blog articles. Pages need to exist at these slugs:
  - `/blog/how-much-does-water-damage-restoration-cost-in-michigan/`
  - `/blog/does-homeowners-insurance-cover-water-damage-in-michigan/`
  - `/blog/mold-after-water-damage-how-fast-does-it-grow-in-michigan/`
  - `/blog/water-damage-timeline-what-happens-in-the-first-24-48-72-hours/`
  - `/blog/frozen-pipe-burst-grand-rapids-what-to-do-first/`
  - `/blog/basement-flooding-grand-rapids-causes-and-restoration/`
  - `/blog/sump-pump-failure-cleanup-grand-rapids/`
  - `/blog/category-3-sewage-backup-health-risks-and-cleanup/`
  - `/blog/how-to-document-water-damage-for-your-insurance-claim/`
  - `/blog/water-damage-restoration-vs-mitigation-whats-the-difference/`
- [ ] **Custom 404 page** — no branded error page currently exists

---

## Ongoing — Conversion & AI Search

- [ ] A/B test hero headline — urgency vs. trust-first messaging
- [ ] GHL automation sequences — SMS + email follow-up after every form submission
- [ ] GHL review request automation — auto-send Google review link after job closes
- [ ] Monitor AI citations — search "water damage restoration Grand Rapids" in ChatGPT, Perplexity, Google AI Overviews. Ryan's business should be cited. Update `llms.txt` if not appearing.
- [ ] Update `llms.txt` as review count grows and new blog articles publish
- [ ] Exit intent popup — consider adding a real offer (free inspection, priority callback slot)

---

## Deployment Setup

- [ ] Connect Vercel project to **Mattpenny51/disaster911** (main branch) for auto-deploy on push
- [ ] Add custom domain `disaster911.net` in Vercel dashboard
- [ ] Confirm HTTPS / SSL is enforced
- [ ] Set up **301 redirects** if the old site had indexed URLs at different paths
- [ ] Set branch protection on `main` — require PR review before merge
- [ ] Move API keys to **environment variables** — do not hardcode in production files
- [ ] Set CDN caching headers for `/images/` and static assets

---

## Codebase Notes

| File | Purpose |
|------|---------|
| `script.js` | GHL integrations, UTM capture, exit intent, chat widget, form handling |
| `google-reviews.js` | Live Google Reviews via Maps JS API + PlacesService |
| `styles.css` | Global stylesheet — CSS custom properties at top |
| `rebuild-city-pages.js` | Regenerates all 204 city pages (51 cities × 4 services) |
| `build-hub-pages.js` | Regenerates the 4 service hub pages |
| `cities.json` | Per-city geo hooks, risk content, neighborhoods, zip codes |
| `llms.txt` | Structured business facts for AI/LLM citation |
| `robots.txt` | Allows all major AI crawlers (GPTBot, ClaudeBot, Perplexity, etc.) |
| `images/mi-builder-license.jpg` | Michigan state seal / builder license badge |

**To rebuild city or hub pages after content changes:**
```bash
node rebuild-city-pages.js   # regenerates all 204 city pages
node build-hub-pages.js      # regenerates the 4 hub pages
```

---

## Contact

**Ryan Penny** — Owner
(616) 822-1978 — rpenny@disaster911.net
Available 24/7
