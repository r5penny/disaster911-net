# Disaster911 Marketing Team — Agent Dashboard

Automated digital marketing system for **Disaster Response by Ryan** (disaster911.net).

---

## What Each Agent Does

### `agents/citation-auditor.js`
Audits NAP (Name, Address, Phone) consistency across 16 citation directories. Fetches each directory's listing page via HTTP, searches for the exact business name, phone, and address, and generates a color-coded report.

- **Output:** Console table (green/yellow/red) + `reports/citation-audit-{timestamp}.json`
- **Key metric:** % of reachable directories with all 3 NAP fields correct

### `agents/gbp-manager.js`
Google Business Profile management via the My Business API v4 (OAuth2). Can fetch location info, publish posts, list recent posts, fetch unanswered reviews, reply to reviews, and pull GBP Insights.

- **Requires:** Google OAuth2 credentials + refresh token (see setup below)

### `agents/content-generator.js`
Uses Claude claude-haiku-4-5-20251001 (cost-efficient) to generate:
- **GBP posts** for 7 service/topic types with a local Grand Rapids angle
- **Review replies** that are personalized and professional (under 200 words)
- **Outreach emails** for directory submission with full NAP + IICRC credentials
- **FAQ answers** optimized for Google featured snippets / AI overviews (40–80 words)

### `agents/seo-monitor.js`
SEO health monitoring for disaster911.net:
- **PageSpeed Insights** — mobile + desktop scores for Performance, SEO, Accessibility
- **Core Web Vitals** — LCP, CLS, INP grades (good / needs improvement / poor)
- **Schema markup validation** — checks JSON-LD blocks parse correctly and include expected @type values
- **Sitemap health** — counts URLs, spot-checks 5 random pages for HTTP 200

### `agents/backlink-tracker.js`
Tracks directory listing status and generates an outreach priority list:
- Checks high-priority directories for listing signals (URL, phone, name)
- Ranks unlisted directories by priority (high → medium → low)
- Includes step-by-step submission instructions for each directory

### `agents/review-responder.js`
Review management and monitoring:
- Fetches unanswered GBP reviews
- Drafts AI-generated replies saved to `data/review-drafts.json` for approval before posting
- Flags negative reviews (below 4 stars) for immediate attention
- Generates weekly review summary reports

---

## Setup

### 1. Install Dependencies

```bash
cd marketing-team
npm install
```

### 2. Fill in Credentials — `config.js`

Open `config.js` and replace all `YOUR_..._HERE` placeholders:

| Credential | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/account/keys |
| `GOOGLE_OAUTH_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Same as above |
| `GOOGLE_REFRESH_TOKEN` | OAuth Playground (see GBP setup below) |
| `GBP_ACCOUNT_ID` | Call GBP API accounts endpoint (see below) |
| `GBP_LOCATION_ID` | Call GBP API locations endpoint (see below) |
| `PAGESPEED_API_KEY` | Google Cloud Console → Create API Key → restrict to PageSpeed Insights API |

**Note:** Agents gracefully skip their functions and print a warning if credentials are missing — they won't crash the dashboard.

---

## How to Run

### Interactive Dashboard (recommended)
```bash
node index.js
```
Launches the numbered menu. Navigate with 0–9.

### Command-line shortcuts
```bash
npm run audit       # Full marketing audit (all agents)
npm run citations   # Citation NAP audit only
npm run seo         # SEO health check only
npm run gbp         # GBP management submenu
npm run generate    # Content generation submenu
npm run full        # Same as audit
node index.js schedule  # Start cron scheduler (see below)
```

---

## Scheduled Tasks

Run `node index.js schedule` to start the built-in cron scheduler:

| Task | Schedule | Timezone |
|---|---|---|
| Citation audit | Mondays at 8:00 AM | America/Detroit |
| SEO audit | Wednesdays at 8:00 AM | America/Detroit |
| GBP post (auto-publish) | Fridays at 9:00 AM | America/Detroit |
| Review check | Daily at 7:00 AM | America/Detroit |

**Important:** The GBP auto-post on Fridays generates and publishes automatically. Make sure `GOOGLE_REFRESH_TOKEN` and `ANTHROPIC_API_KEY` are set before enabling this.

---

## Running as a Persistent Service

### Option A — PM2 (recommended for local/VPS)

```bash
npm install -g pm2
pm2 start index.js --name disaster911-marketing -- schedule
pm2 save
pm2 startup   # Follow the printed command to run on reboot
```

Check status:
```bash
pm2 status
pm2 logs disaster911-marketing
```

### Option B — Windows Task Scheduler

1. Open **Task Scheduler** → Create Basic Task
2. Name: `Disaster911 Marketing`
3. Trigger: **Daily** at 7:00 AM
4. Action: **Start a program**
   - Program: `node`
   - Arguments: `"G:\My Drive\01-ACTIVE PROJECTS\DisasterResponse-Build-2026-02-28\marketing-team\index.js" full`
   - Start in: `G:\My Drive\01-ACTIVE PROJECTS\DisasterResponse-Build-2026-02-28\marketing-team`
5. Finish, then open the task properties and check **"Run whether user is logged on or not"**

For the scheduler mode (persistent):
- Arguments: `index.js schedule`
- Set trigger to: **At startup** or **When computer starts**

---

## GBP API Setup Walkthrough

### Step 1 — Create a Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click **Select a project** → **New Project**
3. Name it `disaster911-marketing` and create it

### Step 2 — Enable Required APIs

In the Google Cloud Console, go to **APIs & Services → Library** and enable:
- **My Business API** (search "My Business")
- **Business Profile Performance API**
- **Google Search Console API**
- **PageSpeed Insights API**

### Step 3 — Create OAuth2 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth 2.0 Client IDs**
3. Application type: **Desktop app**
4. Name: `disaster911-marketing-desktop`
5. Download the JSON — copy `client_id` → `GOOGLE_OAUTH_CLIENT_ID` and `client_secret` → `GOOGLE_OAUTH_CLIENT_SECRET`

### Step 4 — Get a Refresh Token via OAuth Playground

1. Go to https://developers.google.com/oauthplayground
2. Click the gear icon ⚙ → check **"Use your own OAuth credentials"**
3. Enter your `client_id` and `client_secret`
4. In the scope box, enter:
   ```
   https://www.googleapis.com/auth/business.manage
   ```
5. Click **Authorize APIs** → sign in with the Google account that owns the GBP listing
6. Click **Exchange authorization code for tokens**
7. Copy the `refresh_token` value → paste into `GOOGLE_REFRESH_TOKEN` in config.js

### Step 5 — Find Your Account ID and Location ID

With your access token from Step 4, call the API:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://mybusiness.googleapis.com/v4/accounts"
```

Copy the `name` field (e.g. `accounts/123456789`) → `GBP_ACCOUNT_ID`

Then list locations:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://mybusiness.googleapis.com/v4/accounts/YOUR_ACCOUNT_ID/locations"
```

Copy the `name` field of your business (e.g. `locations/987654321`) → `GBP_LOCATION_ID`

---

## Reports

All audit reports are saved to `reports/` as JSON files with timestamps:
- `citation-audit-{timestamp}.json`
- `seo-audit-{timestamp}.json`
- `backlink-audit-{timestamp}.json`
- `weekly-review-report-{timestamp}.json`

View the most recent report from the interactive menu: **option 8**.

Review reply drafts are saved to `data/review-drafts.json` for approval before posting.

---

## Business Info (source of truth)

All agents pull from:
- `config.js` → `BUSINESS` constant (NAP, contact, certifications)
- `data/business-profile.json` → Extended business data (hours, services, service area, social)
- `data/directories.json` → Citation directory list with status tracking

Update these files if any business info changes (new phone, address change, etc.).

---

## Troubleshooting

**"ANTHROPIC_API_KEY not set"** — Fill in config.js. Content generation will use fallback templates until set.

**"GBP credentials missing"** — Fill in the Google OAuth fields. GBP functions will print a warning and skip gracefully.

**"Failed to load agent"** — Run `npm install` to ensure all dependencies are installed.

**Citation audit returns all "Error"** — Some directories block automated requests. This is expected for some sites. Check the reports for which ones are reachable.

**PageSpeed returns no data** — PageSpeed Insights can be slow (up to 60s per page). This is normal. The API key is optional but recommended to avoid quota limits.
