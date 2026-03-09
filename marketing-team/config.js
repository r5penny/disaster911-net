/**
 * config.js — Central configuration for Disaster911 Marketing Team agents
 *
 * HOW TO FILL IN CREDENTIALS:
 * ─────────────────────────────────────────────────────────────────────────────
 * ANTHROPIC_API_KEY
 *   → https://console.anthropic.com/account/keys
 *   → Create a new API key, paste it below.
 *
 * GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET
 *   → https://console.cloud.google.com/
 *   → Enable: "My Business API", "Business Profile Performance API", "Google Search Console API", "PageSpeed Insights API"
 *   → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Desktop app)
 *   → Download JSON, copy client_id and client_secret here.
 *
 * GOOGLE_REFRESH_TOKEN
 *   → After creating OAuth credentials, run the OAuth flow once manually
 *     to get a refresh token. Tools like https://developers.google.com/oauthplayground
 *     can help. Scope needed: https://www.googleapis.com/auth/business.manage
 *   → Paste the refresh_token here.
 *
 * GBP_ACCOUNT_ID
 *   → Format: "accounts/123456789"
 *   → Find at: https://mybusiness.googleapis.com/v4/accounts
 *     (call that endpoint with your OAuth token to see your account ID)
 *
 * GBP_LOCATION_ID
 *   → Format: "locations/987654321"
 *   → Find at: https://mybusiness.googleapis.com/v4/{accountId}/locations
 *
 * GOOGLE_SEARCH_CONSOLE_SITE_URL
 *   → The exact property URL as registered in Google Search Console.
 *   → Check at: https://search.google.com/search-console/welcome
 *
 * PAGESPEED_API_KEY
 *   → https://console.cloud.google.com/ → APIs & Services → Credentials → Create API Key
 *   → Restrict it to "PageSpeed Insights API" for security.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const config = {
  // ── Anthropic (Claude AI) ───────────────────────────────────────────────────
  ANTHROPIC_API_KEY: 'YOUR_ANTHROPIC_API_KEY_HERE',

  // ── Google OAuth2 (for GBP API + Search Console) ───────────────────────────
  GOOGLE_OAUTH_CLIENT_ID:     'YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE',
  GOOGLE_OAUTH_CLIENT_SECRET: 'YOUR_GOOGLE_OAUTH_CLIENT_SECRET_HERE',
  GOOGLE_REFRESH_TOKEN:       'YOUR_GOOGLE_REFRESH_TOKEN_HERE',

  // ── Google Business Profile ─────────────────────────────────────────────────
  // Example: "accounts/112233445566"
  GBP_ACCOUNT_ID:   'accounts/YOUR_GBP_ACCOUNT_ID_HERE',
  // Example: "locations/778899001122"
  GBP_LOCATION_ID:  'locations/YOUR_GBP_LOCATION_ID_HERE',

  // ── Google Search Console ───────────────────────────────────────────────────
  GOOGLE_SEARCH_CONSOLE_SITE_URL: 'https://disaster911.net',

  // ── PageSpeed Insights ──────────────────────────────────────────────────────
  PAGESPEED_API_KEY: 'YOUR_PAGESPEED_API_KEY_HERE',
};

// ── Canonical Business NAP (Name / Address / Phone) ─────────────────────────
// This is the single source of truth used by all agents.
const BUSINESS = {
  name:     'Disaster Response by Ryan',
  owner:    'Ryan Penny',
  phone:    '(616) 822-1978',
  phoneRaw: '6168221978',
  email:    'rpenny@disaster911.net',
  website:  'https://disaster911.net',
  address: {
    street:  '3707 Northridge Dr NW STE 10',
    city:    'Walker',
    state:   'MI',
    zip:     '49544',
    full:    '3707 Northridge Dr NW STE 10, Walker, MI 49544',
  },
  googleMapsCID: '14615414471722616873',
  googleMapsUrl: 'https://www.google.com/maps?cid=14615414471722616873',
  rating:        5.0,
  reviewCount:   150,
  certifications: ['IICRC Certified Firm', 'WTR (Water Damage Restoration)', 'ASD (Applied Structural Drying)'],
  serviceArea:   'Grand Rapids, Walker, Kentwood, Wyoming, Grandville, and West Michigan',
  services: ['Water Damage Restoration', 'Fire Damage Restoration', 'Mold Remediation', 'Sewage Cleanup'],
};

// ── Credential validator ──────────────────────────────────────────────────────
// Each agent calls this to check whether its required credentials are present.
// Returns { valid: bool, missing: string[] }
function validateCredentials(required) {
  const missing = required.filter(key => {
    const val = config[key];
    return !val || val.startsWith('YOUR_');
  });
  return { valid: missing.length === 0, missing };
}

module.exports = { config, BUSINESS, validateCredentials };
