/**
 * google-reviews.js — Disaster Response by Ryan
 *
 * Fetches live Google reviews via the Maps JavaScript API (Places Service) and
 * populates the reviews grid, rating score, and review count on any page that
 * has the matching DOM targets.
 *
 * =============================================================================
 * ONE-TIME SETUP
 * =============================================================================
 *
 * STEP 1 — Create a Google Cloud API Key
 *   1. Go to: https://console.cloud.google.com/
 *   2. Create a project (or select an existing one)
 *   3. Enable these two APIs:
 *        • Maps JavaScript API
 *        • Places API
 *   4. Go to Credentials → Create Credentials → API Key
 *   5. Click "Restrict Key" and under "API restrictions" select
 *        Maps JavaScript API + Places API
 *   6. Under "Website restrictions" add:
 *        disaster911.net/*
 *        *.disaster911.net/*
 *        disaster911.vercel.app/*  (your staging URL)
 *   7. Paste the key below as GOOGLE_MAPS_API_KEY
 *
 * STEP 2 — Find Your Google Place ID
 *   Option A (easiest): Open this URL in your browser and search your business:
 *     https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
 *   Option B: Google Maps → search "Disaster Response by Ryan Walker MI"
 *     → click your listing → look at the URL for &ludocid= or use the
 *     Place ID Finder tool above.
 *   The Place ID starts with "ChIJ" followed by letters and numbers.
 *   Paste it below as GOOGLE_PLACE_ID.
 *
 * STEP 3 — Set the values, deploy, done.
 *
 * =============================================================================
 * WHERE REVIEWS RENDER
 * =============================================================================
 *
 * Homepage (index.html) — already wired:
 *   #gr-reviews-grid   → review cards are injected here (replaces static fallbacks)
 *   #gr-rating-score   → updated with live overall rating (e.g. "4.8")
 *   #gr-rating-total   → updated with live review count (e.g. "152 Reviews")
 *
 * Contact page (contact/index.html) — already wired:
 *   #gr-contact-reviews → compact 2-column review strip injected here
 *
 * Any other page — add this div and reviews will appear there too:
 *   <div data-gr-widget></div>
 *
 * =============================================================================
 */

// ── Configuration ─────────────────────────────────────────────────────────────

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
const GOOGLE_PLACE_ID     = 'YOUR_GOOGLE_PLACE_ID_HERE';

// Only show reviews with this many stars or more (4 or 5)
const GR_MIN_STARS = 4;

// Max cards to show in the full grid (Google Places API returns max 5)
const GR_MAX_REVIEWS = 5;

// Max cards on the compact contact-page strip
const GR_CONTACT_MAX = 3;

// ─────────────────────────────────────────────────────────────────────────────

// Google G logo SVG — reused in every review card
const GOOGLE_G_SVG = `<svg width="18" height="18" viewBox="0 0 48 48" aria-label="Google review" role="img" style="flex-shrink:0;margin-left:auto;">
  <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
  <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
  <path fill="#FBBC05" d="M11.68 28.18A13.9 13.9 0 0 1 10.8 24c0-1.45.25-2.86.68-4.18v-5.7H4.34A23.93 23.93 0 0 0 2 24c0 3.86.92 7.52 2.54 10.76l7.14-5.58z"/>
  <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.34 5.7c1.74-5.2 6.59-9.07 12.32-9.07z"/>
</svg>`;

// Avatar background colors — cycles through these for reviewers without photos
const AVATAR_COLORS = ['#4285f4', '#34a853', '#ea4335', '#fbbc05', '#8b5cf6', '#06b6d4'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildStars(rating, size = '0.75rem') {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= Math.round(rating);
        html += `<i class="fa-${filled ? 'solid' : 'regular'} fa-star" style="color:${filled ? '#fbbc05' : '#4b5563'};font-size:${size};"></i>`;
    }
    return html;
}

function buildAvatar(review, index) {
    // Use the reviewer's Google profile photo if available
    if (review.profile_photo_url) {
        return `<img src="${review.profile_photo_url}" alt="${escapeAttr(review.author_name)}"
            width="44" height="44" loading="lazy"
            style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;"
            onerror="this.outerHTML=buildInitialAvatar('${escapeAttr(review.author_name)}',${index})">`;
    }
    return buildInitialAvatar(review.author_name, index);
}

function buildInitialAvatar(name, index) {
    const initial = (name || '?').charAt(0).toUpperCase();
    const color   = AVATAR_COLORS[index % AVATAR_COLORS.length];
    return `<div style="width:44px;height:44px;border-radius:50%;background:${color};display:flex;
        align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.1rem;flex-shrink:0;">
        ${initial}</div>`;
}

function escapeAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

// ── Card builders ─────────────────────────────────────────────────────────────

function buildFullCard(review, index) {
    const name   = escapeHTML(review.author_name || 'Verified Customer');
    const text   = escapeHTML(review.text || '');
    const time   = escapeHTML(review.relative_time_description || '');
    const avatar = buildAvatar(review, index);
    const stars  = buildStars(review.rating);

    // Show a shortened excerpt with a "read more" expand
    const MAX_CHARS = 220;
    const needsTrunc = text.length > MAX_CHARS;
    const shortText  = needsTrunc ? text.slice(0, MAX_CHARS).trimEnd() + '…' : text;
    const expandBtn  = needsTrunc
        ? `<button onclick="this.previousElementSibling.textContent='${text.replace(/'/g,"\\'")}';this.remove();"
            style="background:none;border:none;color:#60a5fa;cursor:pointer;padding:0;font-size:.8rem;font-weight:600;margin-top:.25rem;">
            Read more</button>`
        : '';

    return `
    <div style="background:var(--bg-white);border:1px solid rgba(255,255,255,0.08);
        border-radius:var(--radius-lg);padding:1.5rem;display:flex;flex-direction:column;gap:1rem;">
        <div style="display:flex;align-items:center;gap:0.75rem;">
            ${avatar}
            <div>
                <div style="font-weight:700;font-size:.9rem;">${name}</div>
                <div style="display:flex;gap:2px;margin-top:2px;">${stars}</div>
            </div>
            ${GOOGLE_G_SVG}
        </div>
        <div style="font-size:.9rem;color:var(--text-main);line-height:1.65;flex:1;">
            <span class="gr-review-text">"${shortText}"</span>
            ${expandBtn}
        </div>
        <div style="font-size:.78rem;color:var(--text-muted);">${time}</div>
    </div>`;
}

function buildCompactCard(review, index) {
    const name   = escapeHTML(review.author_name || 'Verified Customer');
    const text   = escapeHTML(review.text || '');
    const time   = escapeHTML(review.relative_time_description || '');
    const avatar = buildAvatar(review, index);
    const stars  = buildStars(review.rating, '0.7rem');
    const short  = text.length > 160 ? text.slice(0, 160).trimEnd() + '…' : text;

    return `
    <div style="background:var(--bg-white,#1a1f2e);border:1px solid rgba(255,255,255,0.08);
        border-radius:.75rem;padding:1.25rem;display:flex;flex-direction:column;gap:.75rem;">
        <div style="display:flex;align-items:center;gap:.6rem;">
            ${avatar}
            <div style="min-width:0;">
                <div style="font-weight:700;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
                <div style="display:flex;gap:2px;margin-top:2px;">${stars}</div>
            </div>
            ${GOOGLE_G_SVG}
        </div>
        <p style="font-size:.85rem;color:var(--text-main,#e5e7eb);line-height:1.6;margin:0;flex:1;">"${short}"</p>
        <div style="font-size:.75rem;color:var(--text-muted,#6b7280);">${time}</div>
    </div>`;
}

// ── Render functions ──────────────────────────────────────────────────────────

function renderHomepageReviews(place) {
    const grid      = document.getElementById('gr-reviews-grid');
    const scoreEl   = document.getElementById('gr-rating-score');
    const totalEl   = document.getElementById('gr-rating-total');

    // Update live rating + count badges
    if (scoreEl && place.rating) {
        scoreEl.textContent = place.rating.toFixed(1);
    }
    if (totalEl && place.user_ratings_total) {
        const count = place.user_ratings_total;
        totalEl.textContent = `${count.toLocaleString()} Review${count !== 1 ? 's' : ''}`;
    }

    if (!grid) return;

    const reviews = (place.reviews || [])
        .filter(r => r.rating >= GR_MIN_STARS)
        .slice(0, GR_MAX_REVIEWS);

    if (reviews.length === 0) return; // Keep fallback static cards

    grid.innerHTML = reviews.map((r, i) => buildFullCard(r, i)).join('');
}

function renderContactReviews(place) {
    const container = document.getElementById('gr-contact-reviews');
    if (!container) return;

    const reviews = (place.reviews || [])
        .filter(r => r.rating >= GR_MIN_STARS)
        .slice(0, GR_CONTACT_MAX);

    if (reviews.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;">
            ${reviews.map((r, i) => buildCompactCard(r, i)).join('')}
        </div>`;
}

function renderGenericWidgets(place) {
    document.querySelectorAll('[data-gr-widget]').forEach((container, idx) => {
        const reviews = (place.reviews || [])
            .filter(r => r.rating >= GR_MIN_STARS)
            .slice(0, GR_MAX_REVIEWS);

        if (reviews.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.25rem;">
                ${reviews.map((r, i) => buildFullCard(r, i + idx * 5)).join('')}
            </div>`;
    });
}

// ── API bootstrap ─────────────────────────────────────────────────────────────

function hasTargets() {
    return !!(
        document.getElementById('gr-reviews-grid') ||
        document.getElementById('gr-contact-reviews') ||
        document.querySelector('[data-gr-widget]')
    );
}

function fetchAndRender() {
    if (!hasTargets()) return;

    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        console.warn('[Google Reviews] Set GOOGLE_MAPS_API_KEY in google-reviews.js');
        return;
    }
    if (!GOOGLE_PLACE_ID || GOOGLE_PLACE_ID === 'YOUR_GOOGLE_PLACE_ID_HERE') {
        console.warn('[Google Reviews] Set GOOGLE_PLACE_ID in google-reviews.js');
        return;
    }

    // Expose callback globally (Maps JS API calls it after loading)
    window.__grMapsReady = function () {
        // PlacesService needs an element or Map instance — we use a hidden div
        const anchor = document.createElement('div');
        anchor.style.cssText = 'width:1px;height:1px;position:absolute;top:-9999px;left:-9999px;';
        document.body.appendChild(anchor);

        const map = new google.maps.Map(anchor, { center: { lat: 43.0011, lng: -85.7335 }, zoom: 1 });
        const svc = new google.maps.places.PlacesService(map);

        svc.getDetails(
            {
                placeId: GOOGLE_PLACE_ID,
                fields: ['name', 'rating', 'user_ratings_total', 'reviews', 'url'],
            },
            (place, status) => {
                anchor.remove();

                if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
                    console.warn('[Google Reviews] PlacesService error:', status);
                    // Leave static fallback cards in place
                    return;
                }

                renderHomepageReviews(place);
                renderContactReviews(place);
                renderGenericWidgets(place);
            }
        );
    };

    // Load the Maps JS API (once — guard against double load)
    if (!document.getElementById('gr-maps-script')) {
        const script    = document.createElement('script');
        script.id       = 'gr-maps-script';
        script.src      = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=__grMapsReady`;
        script.async    = true;
        script.defer    = true;
        script.onerror  = () => console.error('[Google Reviews] Failed to load Maps JS API. Check your API key and billing.');
        document.head.appendChild(script);
    }
}

// Run after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchAndRender);
} else {
    fetchAndRender();
}
