/**
 * build-hub-pages.js
 * Generates the 4 service hub pages (water, fire, mold, sewage).
 * Run: node build-hub-pages.js
 */

const fs   = require('fs');
const path = require('path');

const BASE = __dirname;
const PHONE_DISPLAY = '(616) 822-1978';
const PHONE_LINK    = '6168221978';
const SMS_LINK      = '6168221978';

/* ── 51-city list ─────────────────────────────────────────────────────────── */
const CITIES = [
  { slug:'ada-mi',             name:'Ada' },
  { slug:'allendale-mi',       name:'Allendale' },
  { slug:'alpine-mi',          name:'Alpine' },
  { slug:'blendon-mi',         name:'Blendon' },
  { slug:'byron-center-mi',    name:'Byron Center' },
  { slug:'caledonia-mi',       name:'Caledonia' },
  { slug:'cascade-mi',         name:'Cascade' },
  { slug:'cedar-springs-mi',   name:'Cedar Springs' },
  { slug:'chester-mi',         name:'Chester' },
  { slug:'comstock-park-mi',   name:'Comstock Park' },
  { slug:'coopersville-mi',    name:'Coopersville' },
  { slug:'cutlerville-mi',     name:'Cutlerville' },
  { slug:'dorr-mi',            name:'Dorr' },
  { slug:'east-grand-rapids-mi', name:'East Grand Rapids' },
  { slug:'ferrysburg-mi',      name:'Ferrysburg' },
  { slug:'forest-hills-mi',    name:'Forest Hills' },
  { slug:'fruitport-mi',       name:'Fruitport' },
  { slug:'gaines-mi',          name:'Gaines' },
  { slug:'georgetown-mi',      name:'Georgetown' },
  { slug:'grand-haven-mi',     name:'Grand Haven' },
  { slug:'grand-rapids-mi',    name:'Grand Rapids' },
  { slug:'grandville-mi',      name:'Grandville' },
  { slug:'grant-mi',           name:'Grant' },
  { slug:'greenville-mi',      name:'Greenville' },
  { slug:'hastings-mi',        name:'Hastings' },
  { slug:'holland-mi',         name:'Holland' },
  { slug:'hudsonville-mi',     name:'Hudsonville' },
  { slug:'ionia-mi',           name:'Ionia' },
  { slug:'jamestown-mi',       name:'Jamestown' },
  { slug:'jenison-mi',         name:'Jenison' },
  { slug:'kent-city-mi',       name:'Kent City' },
  { slug:'kentwood-mi',        name:'Kentwood' },
  { slug:'lowell-mi',          name:'Lowell' },
  { slug:'montague-mi',        name:'Montague' },
  { slug:'moorland-mi',        name:'Moorland' },
  { slug:'muskegon-mi',        name:'Muskegon' },
  { slug:'norton-shores-mi',   name:'Norton Shores' },
  { slug:'plainfield-mi',      name:'Plainfield' },
  { slug:'port-sheldon-mi',    name:'Port Sheldon' },
  { slug:'ravenna-mi',         name:'Ravenna' },
  { slug:'rockford-mi',        name:'Rockford' },
  { slug:'sparta-mi',          name:'Sparta' },
  { slug:'spring-lake-mi',     name:'Spring Lake' },
  { slug:'sullivan-mi',        name:'Sullivan' },
  { slug:'tallmadge-mi',       name:'Tallmadge' },
  { slug:'walker-mi',          name:'Walker' },
  { slug:'wayland-mi',         name:'Wayland' },
  { slug:'whitehall-mi',       name:'Whitehall' },
  { slug:'wright-mi',          name:'Wright' },
  { slug:'wyoming-mi',         name:'Wyoming' },
  { slug:'zeeland-mi',         name:'Zeeland' },
];

/* ── Shared photo data ────────────────────────────────────────────────────── */
const PHOTOS = {
  water: [
    { src:'moisture-meter-999-water-damage-wall-inspection-grand-rapids.jpg',    alt:'Moisture meter at 999 during wall inspection — Grand Rapids, MI' },
    { src:'phoenix-dehumidifier-water-damage-bathroom-grand-rapids.jpg',         alt:'Phoenix commercial dehumidifier in water-damaged bathroom — Grand Rapids, MI' },
    { src:'structural-drying-air-movers-living-room-grand-rapids.jpg',           alt:'Multiple air movers set up for structural drying — Grand Rapids, MI' },
    { src:'iicrc-water-damage-structural-drying-grand-rapids-mi.jpg',            alt:'IICRC certified structural drying setup — Grand Rapids, MI' },
    { src:'water-damage-restoration-living-room-equipment-grand-rapids.jpg',     alt:'Full water damage restoration equipment deployed — Grand Rapids, MI' },
    { src:'moisture-meter-bathroom-tile-water-damage-grand-rapids.jpg',          alt:'Moisture detection beneath bathroom tile — Grand Rapids, MI' },
  ],
  fire: [
    { src:'fire-damage-restoration-bedroom-soot-grand-rapids-mi.jpg',            alt:'Fire and smoke damage inside bedroom — total char, soot, and structural damage — Grand Rapids, MI' },
    { src:'fire-damage-char-ceiling-structural-grand-rapids-mi.jpg',             alt:'Char damage to ceiling and structural framing after house fire — Grand Rapids, MI' },
    { src:'fire-damage-smoke-soot-interior-grand-rapids-mi.jpg',                 alt:'Smoke and soot coating interior surfaces after fire — Grand Rapids, MI restoration job' },
  ],
  mold: [
    { src:'water-damage-containment-wall-middleville-mi.jpg',                    alt:'IICRC negative-pressure containment wall during mold remediation — Middleville, MI' },
    { src:'water-damage-bedroom-containment-middleville-mi.jpg',                 alt:'Full bedroom containment setup during mold remediation — Middleville, MI' },
    { src:'moisture-meter-ceiling-water-damage-detection-grand-rapids.jpg',      alt:'Moisture detection identifying hidden mold source in ceiling — Grand Rapids, MI' },
    { src:'water-damage-containment-hallway-middleville-mi.jpg',                 alt:'Hallway containment during remediation job — Middleville, MI' },
  ],
  sewage: [
    { src:'water-damage-containment-barrier-middleville-mi.jpg',                 alt:'Professional containment barrier for sewage backup cleanup — Middleville, MI' },
    { src:'water-damage-containment-hallway-middleville-mi.jpg',                 alt:'Hallway contained during Category 3 sewage cleanup — Middleville, MI' },
    { src:'iicrc-water-damage-structural-drying-grand-rapids-mi.jpg',            alt:'Professional equipment deployed after sewage backup — Grand Rapids, MI' },
  ],
};

/* ── Shared helpers ───────────────────────────────────────────────────────── */
const NAV = (depth = '../') => `
    <div class="emergency-bar">
        <div class="container">
            <span><i class="fa-solid fa-triangle-exclamation"></i> 24/7/365 Emergency Response — West Michigan</span>
            <span><i class="fa-solid fa-truck-fast"></i> Under 60-minute dispatch</span>
        </div>
    </div>
    <header class="site-header">
        <div class="container header-inner">
            <div class="logo"><a href="${depth}"><img src="/images/logo.png" alt="Disaster Response by Ryan" width="220" height="60" style="object-fit:contain;"></a></div>
            <nav class="desktop-nav">
                <ul>
                    <li><a href="${depth}water-damage-restoration/">Water Damage</a></li>
                    <li><a href="${depth}fire-damage-restoration/">Fire &amp; Smoke</a></li>
                    <li><a href="${depth}mold-remediation/">Mold</a></li>
                    <li><a href="${depth}sewage-cleanup/">Sewage</a></li>
                    <li><a href="${depth}about/">About</a></li>
                    <li><a href="${depth}insurance-claims/">Insurance</a></li>
                    <li><a href="${depth}blog/">Blog</a></li>
                    <li><a href="${depth}contact/">Contact</a></li>
                </ul>
            </nav>
            <div class="header-cta">
                <a href="tel:${PHONE_LINK}" class="btn btn-primary btn-pulse">
                    <i class="fa-solid fa-phone"></i> ${PHONE_DISPLAY}
                    <span class="btn-subtitle">Call or Text — 24/7</span>
                </a>
            </div>
            <button class="mobile-menu-toggle" aria-label="Toggle menu"><i class="fa-solid fa-bars"></i></button>
        </div>
    </header>
    <nav class="mobile-nav">
        <ul>
            <li><a href="${depth}water-damage-restoration/">Water Damage</a></li>
            <li><a href="${depth}fire-damage-restoration/">Fire &amp; Smoke</a></li>
            <li><a href="${depth}mold-remediation/">Mold Remediation</a></li>
            <li><a href="${depth}sewage-cleanup/">Sewage Cleanup</a></li>
            <li><a href="${depth}about/">About</a></li>
            <li><a href="${depth}insurance-claims/">Insurance Claims</a></li>
            <li><a href="${depth}blog/">Blog</a></li>
            <li><a href="${depth}contact/">Contact</a></li>
        </ul>
    </nav>`;

const FOOTER = (depth = '../') => `
    <footer class="site-footer">
        <div class="container footer-inner">
            <div class="footer-col">
                <div class="footer-logo">
                    <img src="/images/logo.png" alt="Disaster Response by Ryan" width="200" height="55" style="object-fit:contain;filter:brightness(0) invert(1);">
                </div>
                <p>Family-owned restoration company serving West Michigan 24/7. IICRC certified. Direct insurance billing.</p>
                <div class="footer-badges">
                    <span class="badge badge-dark"><i class="fa-solid fa-certificate"></i> IICRC Certified</span>
                    <span class="badge badge-dark"><i class="fa-solid fa-house-chimney"></i> MI Builder's License</span>
                </div>
            </div>
            <div class="footer-col">
                <h3>Contact</h3>
                <address class="nap">
                    Disaster Response by Ryan<br>
                    3707 Northridge Dr NW STE 10<br>
                    Walker, MI 49544<br>
                    <a href="tel:${PHONE_LINK}">${PHONE_DISPLAY}</a><br>
                    <a href="mailto:rpenny@disaster911.net">rpenny@disaster911.net</a>
                </address>
                <div class="mt-2"><strong>24/7 Emergency Service</strong></div>
            </div>
            <div class="footer-col">
                <h3>Services</h3>
                <ul class="footer-links">
                    <li><a href="${depth}water-damage-restoration/">Water Damage Restoration</a></li>
                    <li><a href="${depth}fire-damage-restoration/">Fire &amp; Smoke Damage</a></li>
                    <li><a href="${depth}mold-remediation/">Mold Remediation</a></li>
                    <li><a href="${depth}sewage-cleanup/">Sewage Cleanup</a></li>
                    <li><a href="${depth}insurance-claims/">Insurance Claims</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>Top Areas</h3>
                <ul class="footer-links">
                    <li><a href="${depth}water-damage-restoration/grand-rapids-mi/">Grand Rapids, MI</a></li>
                    <li><a href="${depth}water-damage-restoration/kentwood-mi/">Kentwood, MI</a></li>
                    <li><a href="${depth}water-damage-restoration/rockford-mi/">Rockford, MI</a></li>
                    <li><a href="${depth}water-damage-restoration/holland-mi/">Holland, MI</a></li>
                    <li><a href="${depth}service-areas/">View All 51 Cities &rarr;</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="container footer-bottom-inner">
                <p>&copy; 2026 Disaster Response by Ryan. All Rights Reserved.</p>
                <div class="legal-links">
                    <a href="${depth}privacy-policy/">Privacy Policy</a>
                    <a href="${depth}terms/">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
    <div class="mobile-floating-cta">
        <a href="tel:${PHONE_LINK}" class="mfc-call"><i class="fa-solid fa-phone"></i> Call</a>
        <a href="sms:${SMS_LINK}" class="mfc-text"><i class="fa-solid fa-comment-sms"></i> Text</a>
    </div>
    <script src="${depth}script.js"></script>`;

function photoGrid(photos) {
    const cols = photos.length === 1 ? '1fr' : photos.length === 2 ? '1fr 1fr' : 'repeat(3,1fr)';
    return `
    <div style="display:grid;grid-template-columns:${cols};gap:.75rem;margin:2rem 0;">
        ${photos.map(p => `<img src="/images/${p.src}" alt="${p.alt}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius-md);box-shadow:var(--shadow-sm);">`).join('')}
    </div>`;
}

function faqItem(q, a) {
    return `
<div class="faq-item">
  <button class="faq-question">
    ${q}
    <i class="fa-solid fa-chevron-down" style="font-size:0.8rem;opacity:0.6;"></i>
  </button>
  <div class="faq-answer">
    <div><p style="margin:0;line-height:1.7;">${a}</p></div>
  </div>
</div>`;
}

function sidebar(depth = '../') {
    return `
    <aside style="display:flex;flex-direction:column;gap:1.5rem;">
        <div style="background:var(--accent);color:#000;border-radius:var(--radius-lg);padding:1.75rem;text-align:center;">
            <div style="font-size:1.5rem;font-weight:800;margin-bottom:.5rem;">Emergency?</div>
            <div style="margin-bottom:1.25rem;opacity:.9;font-size:.95rem;">We dispatch in under 60 minutes, 24/7/365.</div>
            <a href="tel:${PHONE_LINK}" style="display:block;background:#fff;color:var(--accent);font-weight:800;padding:.85rem 1rem;border-radius:var(--radius-md);text-decoration:none;margin-bottom:.75rem;font-size:1.05rem;">
                <i class="fa-solid fa-phone"></i> ${PHONE_DISPLAY}
            </a>
            <a href="sms:${SMS_LINK}" style="display:block;background:rgba(255,255,255,.15);color:#000;font-weight:700;padding:.75rem 1rem;border-radius:var(--radius-md);text-decoration:none;font-size:.95rem;">
                <i class="fa-solid fa-comment-sms"></i> Text Us Now
            </a>
        </div>
        <div style="background:#fff;border:1px solid var(--bg-subtle);border-radius:var(--radius-lg);padding:1.5rem;">
            <h3 style="margin:0 0 1rem;font-size:1rem;">Why Disaster Response by Ryan?</h3>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.6rem;font-size:.9rem;">
                <li><i class="fa-solid fa-check" style="color:var(--success);margin-right:.4rem;"></i> IICRC Certified Firm</li>
                <li><i class="fa-solid fa-check" style="color:var(--success);margin-right:.4rem;"></i> Michigan Builder's License</li>
                <li><i class="fa-solid fa-check" style="color:var(--success);margin-right:.4rem;"></i> BBB A+ Rated</li>
                <li><i class="fa-solid fa-check" style="color:var(--success);margin-right:.4rem;"></i> Direct Insurance Billing</li>
                <li><i class="fa-solid fa-check" style="color:var(--success);margin-right:.4rem;"></i> Phoenix Professional Equipment</li>
                <li><i class="fa-solid fa-check" style="color:var(--success);margin-right:.4rem;"></i> 5.0★ Google Reviews</li>
            </ul>
        </div>
        <div style="background:#fff;border:1px solid var(--bg-subtle);border-radius:var(--radius-lg);padding:1.5rem;">
            <h3 style="margin:0 0 1rem;font-size:1rem;">We Bill These Carriers Directly</h3>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.4rem;font-size:.88rem;color:var(--text-muted);">
                <li>State Farm &bull; Allstate &bull; Farmers</li>
                <li>Liberty Mutual &bull; USAA</li>
                <li>Nationwide &bull; Travelers</li>
                <li>Auto-Owners &bull; Progressive</li>
            </ul>
        </div>
        <div style="background:#fff;border:1px solid var(--bg-subtle);border-radius:var(--radius-lg);padding:1.5rem;">
            <h3 style="margin:0 0 1rem;font-size:1rem;">Other Services</h3>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.5rem;font-size:.9rem;">
                <li><a href="${depth}water-damage-restoration/"><i class="fa-solid fa-droplet" style="color:var(--accent);margin-right:.4rem;width:14px;"></i> Water Damage Restoration</a></li>
                <li><a href="${depth}fire-damage-restoration/"><i class="fa-solid fa-fire" style="color:#e85d04;margin-right:.4rem;width:14px;"></i> Fire &amp; Smoke Damage</a></li>
                <li><a href="${depth}mold-remediation/"><i class="fa-solid fa-biohazard" style="color:#2d6a4f;margin-right:.4rem;width:14px;"></i> Mold Remediation</a></li>
                <li><a href="${depth}sewage-cleanup/"><i class="fa-solid fa-pipe-circle-check" style="color:#6b4226;margin-right:.4rem;width:14px;"></i> Sewage Cleanup</a></li>
            </ul>
        </div>
    </aside>`;
}

function reviewCard(quote, author, context) {
    return `
    <div style="background:var(--bg-light);border-left:4px solid var(--accent);border-radius:0 var(--radius-md) var(--radius-md) 0;padding:1.25rem 1.5rem;margin:2rem 0;">
        <div style="font-size:.85rem;color:var(--accent);font-weight:700;margin-bottom:.5rem;">
            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
            &nbsp; Verified Google Review
        </div>
        <p style="font-style:italic;margin:0 0 .5rem;line-height:1.7;">"${quote}"</p>
        <div style="font-size:.85rem;font-weight:700;">${author} <span style="font-weight:400;color:var(--text-muted);">— ${context}</span></div>
    </div>`;
}

function ctaStrip(headline, sub) {
    return `
    <div style="background:var(--accent);color:#000;border-radius:var(--radius-lg);padding:2rem;text-align:center;margin:2.5rem 0;">
        <div style="font-size:1.3rem;font-weight:800;margin-bottom:.4rem;">${headline}</div>
        <div style="opacity:.9;margin-bottom:1.25rem;font-size:.95rem;">${sub}</div>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
            <a href="tel:${PHONE_LINK}" style="background:#fff;color:var(--accent);font-weight:800;padding:.85rem 1.5rem;border-radius:var(--radius-md);text-decoration:none;font-size:1rem;">
                <i class="fa-solid fa-phone"></i> ${PHONE_DISPLAY}
            </a>
            <a href="sms:${SMS_LINK}" style="background:rgba(255,255,255,.18);color:#000;font-weight:700;padding:.85rem 1.5rem;border-radius:var(--radius-md);text-decoration:none;font-size:1rem;border:1px solid rgba(255,255,255,.4);">
                <i class="fa-solid fa-comment-sms"></i> Text Us
            </a>
        </div>
    </div>`;
}

function cityGrid(svcSlug) {
    const links = CITIES.map(c =>
        `<a href="/${svcSlug}/${c.slug}/" class="city-grid-link">
            <i class="fa-solid fa-location-dot" style="color:var(--accent);font-size:.75rem;flex-shrink:0;"></i>${c.name}
        </a>`
    ).join('');
    return `
    <style>.city-grid-link{display:flex;align-items:center;gap:.4rem;padding:.6rem .75rem;background:#fff;border:1px solid var(--bg-subtle);border-radius:var(--radius-md);font-size:.9rem;font-weight:600;text-decoration:none;color:var(--text-main);transition:border-color .2s,box-shadow .2s;}.city-grid-link:hover{border-color:var(--accent);box-shadow:0 2px 8px rgba(0,0,0,.12);}</style>
    <section style="margin-top:3rem;padding:2.5rem 0;">
        <div class="container">
            <h2 style="text-align:center;margin-bottom:.5rem;">All Service Areas</h2>
            <p style="text-align:center;color:var(--text-muted);margin-bottom:2rem;">We serve 51 cities across West Michigan. Click your city for a dedicated local page.</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.75rem;">
                ${links}
            </div>
        </div>
    </section>`;
}

function head({ title, desc, canonical, faqSchema, svcLabel }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://disaster911.net/images/moisture-meter-999-water-damage-wall-inspection-grand-rapids.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="https://disaster911.net/images/moisture-meter-999-water-damage-wall-inspection-grand-rapids.jpg">
    <meta name="geo.region" content="US-MI">
    <meta name="geo.placename" content="Grand Rapids, MI">
    <meta name="geo.position" content="43.0011;-85.7335">
    <meta name="ICBM" content="43.0011, -85.7335">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../styles.css">
    <script type="application/ld+json">
    [
    {
        "@context":"https://schema.org",
        "@type":"LocalBusiness",
        "name":"Disaster Response by Ryan",
        "telephone":"${PHONE_DISPLAY}",
        "url":"https://disaster911.net",
        "address":{"@type":"PostalAddress","streetAddress":"3707 Northridge Dr NW STE 10","addressLocality":"Walker","addressRegion":"MI","postalCode":"49544"},
        "geo":{"@type":"GeoCoordinates","latitude":43.0011,"longitude":-85.7335},
        "openingHours":"Mo-Su 00:00-24:00",
        "priceRange":"$$",
        "areaServed":"West Michigan",
        "image":"https://disaster911.net/images/moisture-meter-999-water-damage-wall-inspection-grand-rapids.jpg",
        "aggregateRating":{"@type":"AggregateRating","ratingValue":"5.0","reviewCount":"150","bestRating":"5"}
    },
    {
        "@context":"https://schema.org",
        "@type":"BreadcrumbList",
        "itemListElement":[
            {"@type":"ListItem","position":1,"name":"Home","item":"https://disaster911.net/"},
            {"@type":"ListItem","position":2,"name":"${svcLabel}","item":"${canonical}"}
        ]
    },
    {
        "@context":"https://schema.org",
        "@type":"FAQPage",
        "mainEntity":${JSON.stringify(faqSchema)}
    },
    {
        "@context":"https://schema.org",
        "@type":"Service",
        "name":"${svcLabel}",
        "provider":{"@type":"LocalBusiness","name":"Disaster Response by Ryan","telephone":"${PHONE_DISPLAY}"},
        "areaServed":"West Michigan",
        "description":"${desc}"
    }
    ]
    </script>
</head>
<body>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   WATER DAMAGE HUB
═══════════════════════════════════════════════════════════════════════════ */
function buildWater() {
    const faqs = [
        { q:'How quickly can you respond to water damage in West Michigan?', a:'We maintain 24/7/365 coverage and dispatch within minutes of your call. In most of the West Michigan metro area we arrive on-site in under 60 minutes. The faster water is extracted, the less secondary damage — so fast dispatch is one of our core commitments.' },
        { q:'What does IICRC-certified water damage restoration actually mean?', a:'The IICRC (Institute of Inspection, Cleaning and Restoration Certification) sets the industry standard — the S500 Standard for Professional Water Damage Restoration. Our technicians follow these protocols for moisture assessment, extraction, drying targets, and documentation. This matters for your insurance claim: carriers expect IICRC-based scope of work.' },
        { q:'Will my homeowner\'s insurance cover water damage restoration?', a:'Most homeowner policies cover sudden and accidental water damage — burst pipes, appliance failures, roof leaks that cause interior damage. We handle direct billing to your carrier, prepare Xactimate estimates (the format adjusters use), and document everything with photos and moisture logs so your claim is fully supported.' },
        { q:'How long does water damage drying take?', a:'Most residential water damage jobs require 3–5 days of active drying, though this depends on the size of the affected area, building materials, and the water category. We visit daily, take moisture readings, and adjust equipment until all readings meet the IICRC drying standard.' },
        { q:'What are the three categories of water damage?', a:'Category 1 is clean water (broken supply line), Category 2 is grey water with some contamination (dishwasher overflow, toilet tank), and Category 3 is black water — sewage, flood water, or water that has sat long enough to become heavily contaminated. Each category requires different extraction and sanitation protocols.' },
        { q:'Can I dry out the water damage myself?', a:'Consumer fans and dehumidifiers from hardware stores lack the capacity to achieve the airflow and moisture removal rates required by IICRC drying standards. Without proper drying, moisture stays trapped in walls and subfloors, leading to hidden mold growth within 24–48 hours. We use Phoenix commercial equipment and verify results with calibrated moisture meters.' },
    ];

    const faqSchema = faqs.map(f => ({
        '@type':'Question',
        name: f.q,
        acceptedAnswer:{ '@type':'Answer', text: f.a }
    }));

    return head({
        title: 'Water Damage Restoration West Michigan | Disaster Response by Ryan',
        desc:  'Water damage emergency in West Michigan? Disaster Response by Ryan dispatches in under 60 minutes, 24/7. IICRC certified. Direct insurance billing to all major carriers. Call or text (616) 822-1978.',
        canonical: 'https://disaster911.net/water-damage-restoration/',
        svcLabel: 'Water Damage Restoration',
        faqSchema,
    }) + NAV('../') + `
    <section class="hero" style="padding:5rem 0 7rem;">
        <div class="hero-overlay"></div>
        <div class="container hero-content" style="grid-template-columns:1fr;">
            <div class="hero-text center" style="margin:0 auto;max-width:750px;">
                <div style="display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:2rem;padding:.4rem 1rem;margin-bottom:1rem;font-size:.85rem;font-weight:600;">
                    <i class="fa-solid fa-circle-check" style="color:#6ee7b7;"></i> IICRC Certified &bull; Phoenix Equipment &bull; Direct Insurance Billing
                </div>
                <h1 style="font-size:clamp(2rem,5vw,3rem);margin-bottom:1rem;">Water Damage Restoration<br>Grand Rapids &amp; West Michigan</h1>
                <p class="subheadline" style="margin:0 auto 2rem;">24/7/365 emergency response. Under 60-minute dispatch. We handle your insurance claim start to finish.</p>
                <div class="hero-actions" style="justify-content:center;">
                    <a href="tel:${PHONE_LINK}" class="btn btn-primary btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call ${PHONE_DISPLAY}</a>
                    <a href="sms:${SMS_LINK}" class="btn btn-secondary btn-large"><i class="fa-solid fa-comment-sms"></i> Text Us Now</a>
                </div>
            </div>
        </div>
    </section>

    <nav aria-label="Breadcrumb" style="background:var(--bg-light);border-bottom:1px solid var(--bg-subtle);padding:.6rem 0;font-size:.85rem;">
        <div class="container">
            <a href="../">Home</a> <span style="margin:0 .4rem;color:var(--text-muted);">/</span>
            <span style="color:var(--text-muted);">Water Damage Restoration</span>
        </div>
    </nav>

    <main style="padding:3rem 0;">
        <div class="container">
            <div class="hub-layout">
                <div>
                    <p class="lead">Water damage can happen without warning — a burst pipe at 2 AM, an appliance failure while you're at work, a basement flood during a spring storm. Every hour that passes allows water to migrate further, weakens structural materials, and raises the risk of mold growth beginning within 24–48 hours.</p>
                    <p>Disaster Response by Ryan is a family-owned, IICRC-certified restoration company based in Walker, MI. We serve all of West Michigan with 24/7/365 emergency dispatch and a commitment to under-60-minute response. We use Phoenix commercial drying equipment — the same tools used by the nation's largest restoration firms — paired with the hands-on accountability of a local owner-operated business.</p>

                    <h2 style="margin-top:2.5rem;">Why Response Speed Matters</h2>
                    <p>The IICRC S500 standard documents how water damage severity escalates over time. In the first few hours, water-saturated materials can often be dried in place. After 24 hours, category escalation begins — clean water becomes contaminated, and soft materials like drywall and insulation may need to be removed. After 48 hours, mold colonization is a near-certainty in warm, wet environments. Our goal is to be on-site before the clock runs out.</p>

                    <h2 style="margin-top:2rem;">Our 6-Step Water Damage Restoration Process</h2>
                    <div style="display:flex;flex-direction:column;gap:0;margin-top:1.75rem;position:relative;">
                        ${[
                            { n:1, icon:'fa-magnifying-glass', color:'#dc2626', title:'Emergency Assessment', body:'We arrive with thermal imaging cameras and calibrated moisture meters to map all affected areas — including hidden moisture behind walls, under flooring, and in ceiling cavities.' },
                            { n:2, icon:'fa-droplet-slash',    color:'#2563eb', title:'Water Extraction',      body:'Truck-mounted and portable extractors remove standing water quickly. IICRC Category 2 and 3 water requires containment protocols during extraction.' },
                            { n:3, icon:'fa-wind',             color:'#0891b2', title:'Structural Drying',     body:'Phoenix high-velocity air movers are placed to create optimal airflow across wet surfaces, accelerating evaporation into the air.' },
                            { n:4, icon:'fa-gauge-high',       color:'#7c3aed', title:'Dehumidification',      body:'Phoenix LGR and desiccant dehumidifiers pull moisture from the air, lowering the ambient humidity that would otherwise re-wet drying materials.' },
                            { n:5, icon:'fa-clipboard-check',  color:'#059669', title:'Daily Monitoring',      body:'We visit every day, log moisture readings, and adjust equipment placement until all materials reach the IICRC drying standard. You receive written daily reports.' },
                            { n:6, icon:'fa-hammer',           color:'#d97706', title:'Reconstruction',        body:"Using our Michigan Builder's License, we rebuild what was removed — drywall, flooring, trim, cabinets — to bring your home fully back to pre-loss condition." },
                        ].map((s, i, arr) => `
                        <div style="display:flex;gap:1.25rem;align-items:flex-start;padding-bottom:${i < arr.length-1 ? '1.75' : '0'}rem;position:relative;">
                            ${i < arr.length-1 ? `<div style="position:absolute;left:23px;top:48px;width:2px;height:calc(100% - 20px);background:rgba(255,255,255,0.08);z-index:0;"></div>` : ''}
                            <div style="flex-shrink:0;width:48px;height:48px;background:${s.color};border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;box-shadow:0 0 0 4px rgba(255,255,255,0.06);">
                                <i class="fa-solid ${s.icon}" style="color:#fff;font-size:1rem;"></i>
                            </div>
                            <div style="flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:1.1rem 1.4rem;">
                                <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.4rem;">
                                    <span style="font-size:0.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${s.color};background:${s.color}22;padding:.15rem .55rem;border-radius:100px;">Step ${s.n}</span>
                                    <strong style="font-size:.97rem;">${s.title}</strong>
                                </div>
                                <p style="margin:0;font-size:.88rem;line-height:1.75;color:var(--text-muted);">${s.body}</p>
                            </div>
                        </div>`).join('')}
                    </div>

                    ${photoGrid(PHOTOS.water.slice(0,3))}

                    <h2 style="margin-top:2rem;">Common Causes of Water Damage in West Michigan</h2>
                    <div class="hub-2col">
                        ${[
                            ['fa-pipe-circle-check','Burst or Frozen Pipes','Michigan winters drive sub-freezing temperatures into uninsulated crawlspaces and exterior walls, causing pipes to freeze and rupture.'],
                            ['fa-faucet-drip','Appliance Failures','Washing machines, dishwashers, water heaters, and refrigerators are among the most common sources of indoor flooding.'],
                            ['fa-house-flood-water','Basement Flooding','Sump pump failures, foundation cracks, and window well leaks are common in West Michigan\'s clay-heavy soils.'],
                            ['fa-cloud-rain','Roof & Ceiling Leaks','Storm damage, ice dams, and failing flashing allow water into attics and ceiling cavities, often going undetected for weeks.'],
                        ].map(([icon,title,text]) => `
                        <div style="background:var(--bg-light);border-radius:var(--radius-md);padding:1.25rem;">
                            <div style="font-weight:700;margin-bottom:.4rem;display:flex;align-items:center;gap:.5rem;"><i class="fa-solid ${icon}" style="color:var(--accent);"></i> ${title}</div>
                            <p style="font-size:.9rem;margin:0;color:var(--text-muted);">${text}</p>
                        </div>`).join('')}
                    </div>

                    ${photoGrid(PHOTOS.water.slice(3,6))}

                    ${ctaStrip('Water in Your Home Right Now?','Call or text — we dispatch in under 60 minutes, 24/7/365.')}

                    <h2>What to Do Before We Arrive</h2>
                    <ul style="display:flex;flex-direction:column;gap:.6rem;margin-top:1rem;">
                        <li><strong>Shut off the water source</strong> if you can safely reach the shutoff valve.</li>
                        <li><strong>Turn off electricity</strong> to rooms with standing water if the panel is accessible from a dry area.</li>
                        <li><strong>Move valuables</strong> — documents, electronics, photos — to dry areas or elevated surfaces.</li>
                        <li><strong>Do not run fans</strong> over Category 2 or 3 water — this spreads contamination. Let us assess first.</li>
                        <li><strong>Document everything</strong> with phone photos before moving or removing anything, for your insurance claim.</li>
                    </ul>

                    ${reviewCard('Ryan Penny and Disaster Response went above and beyond. When my basement flooded, Ryan came over within an hour and assessed the situation. His crew was there the next morning and provided exceptional, reliable and expert service.','M. Patterson','Basement flood — Grand Rapids, MI')}

                    <h2 style="margin-top:2rem;">Frequently Asked Questions</h2>
                    <div style="margin-top:1rem;">
                        ${faqs.map(f => faqItem(f.q, f.a)).join('')}
                    </div>
                </div>
                ${sidebar('../')}
            </div>
        </div>
    </main>

    ${cityGrid('water-damage-restoration')}

    ${FOOTER('../')}
</body>
</html>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FIRE DAMAGE HUB
═══════════════════════════════════════════════════════════════════════════ */
function buildFire() {
    const faqs = [
        { q:'What should I do immediately after a house fire?', a:'First, wait for fire department clearance before re-entering. Once safe to enter, do not disturb soot — it can permanently stain surfaces if spread. Avoid turning on HVAC systems, which circulate soot particles throughout the building. Call us immediately: the faster we begin dry sponging and pre-cleaning, the more surfaces we can save versus replace.' },
        { q:'How long does fire and smoke damage restoration take?', a:'Minor smoke damage from a contained kitchen fire can be remediated in 3–5 days. Significant structural fire damage with full room involvement can take 4–8 weeks including reconstruction. We provide a detailed timeline and daily progress updates throughout.' },
        { q:'Will my homeowner\'s insurance cover fire damage restoration?', a:'Yes — fire damage is one of the most straightforward covered perils in homeowner policies. We handle direct billing to your carrier, prepare Xactimate estimates, document pre- and post-treatment conditions with photos, and coordinate with your adjuster throughout the process.' },
        { q:'Why does smoke damage affect rooms that didn\'t burn?', a:'Smoke is a gas and follows air currents throughout the entire structure, depositing soot on cooler surfaces. Smoke odor molecules penetrate porous materials like drywall, insulation, clothing, and furniture. Even rooms far from the fire can have heavy smoke contamination. We use thermal fogging and hydroxyl generators to eliminate odor at the molecular level.' },
        { q:'What is content pack-out and why is it important?', a:'Content pack-out means we carefully remove and inventory your belongings — furniture, clothing, electronics, documents — and take them to our facility for professional cleaning and odor treatment while your home is being restored. This protects your items from additional soot exposure during construction and often allows us to save items that would otherwise need replacement.' },
        { q:'Can smoke-damaged materials be cleaned or do they need to be replaced?', a:'Many materials can be cleaned and restored — hard surfaces, glass, metals, painted walls — using HEPA vacuuming, dry sponging, and chemical sponging. Porous materials that have been heat-damaged or have heavy soot saturation often need to be removed. We make these determinations using IICRC standards and document everything for your insurance adjuster.' },
    ];

    const faqSchema = faqs.map(f => ({
        '@type':'Question',
        name: f.q,
        acceptedAnswer:{ '@type':'Answer', text: f.a }
    }));

    return head({
        title: 'Fire & Smoke Restoration West Michigan | Disaster Response by Ryan',
        desc:  'Fire or smoke damage in West Michigan? Disaster Response by Ryan responds 24/7. IICRC certified. Complete soot removal, smoke odor elimination, and full reconstruction. Direct insurance billing. Call (616) 822-1978.',
        canonical: 'https://disaster911.net/fire-damage-restoration/',
        svcLabel: 'Fire & Smoke Damage Restoration',
        faqSchema,
    }) + NAV('../') + `
    <section class="hero" style="padding:5rem 0 7rem;background:linear-gradient(135deg,#1a0a00 0%,#3d1a00 50%,#1a0a00 100%);">
        <div class="hero-overlay"></div>
        <div class="container hero-content" style="grid-template-columns:1fr;">
            <div class="hero-text center" style="margin:0 auto;max-width:750px;">
                <div style="display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:2rem;padding:.4rem 1rem;margin-bottom:1rem;font-size:.85rem;font-weight:600;">
                    <i class="fa-solid fa-circle-check" style="color:#6ee7b7;"></i> IICRC Certified &bull; Thermal Fogging &bull; Direct Insurance Billing
                </div>
                <h1 style="font-size:clamp(2rem,5vw,3rem);margin-bottom:1rem;">Fire &amp; Smoke Damage Restoration<br>West Michigan</h1>
                <p class="subheadline" style="margin:0 auto 2rem;">24/7/365 emergency response. Complete soot removal, smoke odor elimination, and full reconstruction under one roof.</p>
                <div class="hero-actions" style="justify-content:center;">
                    <a href="tel:${PHONE_LINK}" class="btn btn-primary btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call ${PHONE_DISPLAY}</a>
                    <a href="sms:${SMS_LINK}" class="btn btn-secondary btn-large"><i class="fa-solid fa-comment-sms"></i> Text Us Now</a>
                </div>
            </div>
        </div>
    </section>

    <nav aria-label="Breadcrumb" style="background:var(--bg-light);border-bottom:1px solid var(--bg-subtle);padding:.6rem 0;font-size:.85rem;">
        <div class="container">
            <a href="../">Home</a> <span style="margin:0 .4rem;color:var(--text-muted);">/</span>
            <span style="color:var(--text-muted);">Fire &amp; Smoke Damage Restoration</span>
        </div>
    </nav>

    <main style="padding:3rem 0;">
        <div class="container">
            <div class="hub-layout">
                <div>
                    <p class="lead">A fire leaves two kinds of damage: what you can see — charred material, structural damage — and what you can't. Smoke infiltrates every room, soot coats every surface, and odor molecules embed into walls, HVAC ductwork, and belongings throughout the entire building. Addressing only what burned is never enough.</p>
                    <p>Disaster Response by Ryan handles the complete scope: emergency board-up and tarping, soot removal, smoke odor elimination using thermal fogging and hydroxyl generation, content pack-out and cleaning, and full structural reconstruction using our Michigan Builder's License. You work with one company from first call to final walkthrough.</p>

                    <h2 style="margin-top:2.5rem;">Why Timing Is Critical After a Fire</h2>
                    <p>Soot is acidic. Within hours of a fire, soot begins to etch and permanently discolor surfaces — chrome fixtures, appliances, tile grout, countertops. Smoke odor molecules bind to porous materials more deeply over time. Prompt, professional pre-cleaning saves materials that would otherwise require replacement, and it saves you money on your insurance claim.</p>

                    <h2 style="margin-top:2rem;">Our Fire Damage Restoration Process</h2>
                    <ol style="display:flex;flex-direction:column;gap:1rem;padding-left:1.25rem;margin-top:1rem;">
                        <li><strong>Emergency Stabilization:</strong> Board-up, tarping, and temporary weatherproofing to secure your property and prevent additional damage from the elements.</li>
                        <li><strong>Full Damage Documentation:</strong> Complete written and photo documentation of all fire, smoke, and soot damage for your insurance claim. Xactimate estimate prepared for your adjuster.</li>
                        <li><strong>Content Pack-Out:</strong> Careful inventory and removal of salvageable belongings to our facility for professional cleaning and odor treatment, protecting them from further soot exposure during restoration.</li>
                        <li><strong>Soot &amp; Debris Removal:</strong> HEPA vacuuming, dry sponge pre-cleaning, and wet chemical sponging of all surfaces. Charred structural materials are demolished and removed.</li>
                        <li><strong>Smoke Odor Elimination:</strong> Thermal fogging penetrates the same pathways smoke used — wall cavities, HVAC ducts, subfloor gaps — neutralizing odor at the molecular level. Hydroxyl generators provide additional odor treatment of contents and air.</li>
                        <li><strong>Structural Reconstruction:</strong> Framing, drywall, insulation, flooring, trim, painting, and cabinetry — everything rebuilt to pre-loss condition with our Michigan Builder's License.</li>
                    </ol>

                    ${photoGrid(PHOTOS.fire)}

                    <h2 style="margin-top:2rem;">Types of Fire &amp; Smoke Damage We Handle</h2>
                    <div class="hub-2col">
                        ${[
                            ['fa-utensils','Kitchen Fires','The most common residential fire type. Grease fires and appliance fires produce heavy, sticky soot that requires professional dry-sponge pre-cleaning before any wet cleaning.'],
                            ['fa-plug','Electrical Fires','Often originate in wall cavities or attic spaces and can spread unseen. Require inspection of wiring and structural assessment before restoration.'],
                            ['fa-fire-flame-curved','Structural Fires','Large fires with significant structural involvement require full demolition of charred material and phased reconstruction.'],
                            ['fa-wind','Smoke & Soot Damage','Even when fire is contained to one room, smoke damage affects the entire building. Deodorization must address all affected areas and HVAC systems.'],
                        ].map(([icon,title,text]) => `
                        <div style="background:var(--bg-light);border-radius:var(--radius-md);padding:1.25rem;">
                            <div style="font-weight:700;margin-bottom:.4rem;display:flex;align-items:center;gap:.5rem;"><i class="fa-solid ${icon}" style="color:#e85d04;"></i> ${title}</div>
                            <p style="font-size:.9rem;margin:0;color:var(--text-muted);">${text}</p>
                        </div>`).join('')}
                    </div>

                    ${ctaStrip('Had a Fire? Call Right Away.','Early response saves surfaces, saves belongings, and saves money on your insurance claim.')}

                    <h2>Working with Your Insurance Company</h2>
                    <p>Fire claims are complex — they involve multiple damage categories, salvage vs. replacement decisions, and content inventory. We handle the entire process: Xactimate estimate, photo documentation, scope of work justification, and direct communication with your adjuster. In most cases you pay only your deductible.</p>

                    ${reviewCard('After the fire in our living room I didn\'t know where to start. Disaster Response did an excellent job with cleanup, smoke remediation, and painting. They made an awful situation manageable. Honest, fair pricing.','J. Brouwer','Fire &amp; smoke damage — West Michigan')}

                    <h2 style="margin-top:2rem;">Frequently Asked Questions</h2>
                    <div style="margin-top:1rem;">
                        ${faqs.map(f => faqItem(f.q, f.a)).join('')}
                    </div>
                </div>
                ${sidebar('../')}
            </div>
        </div>
    </main>

    ${cityGrid('fire-damage-restoration')}

    ${FOOTER('../')}
</body>
</html>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOLD REMEDIATION HUB
═══════════════════════════════════════════════════════════════════════════ */
function buildMold() {
    const faqs = [
        { q:'How do I know if I have mold in my home?', a:'Visible mold growth (black, green, white, or grey patches), a persistent musty odor, unexplained allergy-like symptoms, or a recent water damage event that was not professionally dried are all indicators. However, mold often grows inside wall cavities and under flooring where it\'s invisible. If you suspect mold, a professional inspection with moisture mapping is the right starting point.' },
        { q:'Is all mold dangerous?', a:'All mold should be addressed, but the health impact varies by species and exposure level. Stachybotrys (black mold) is the variety most associated with serious health effects, but even common molds can trigger respiratory issues, especially in children, elderly people, and those with asthma or immune conditions. We follow IICRC S520 protocols regardless of mold species.' },
        { q:'Will my insurance cover mold remediation?', a:'Coverage depends on the cause. Mold that results from a covered water loss (burst pipe, appliance failure) is typically covered. Mold resulting from long-term neglect or humidity problems often is not. We document the causal chain — the water source, the timeline, and the resulting mold — to support your claim.' },
        { q:'Can I remove mold myself with bleach?', a:'Bleach kills surface mold on non-porous materials (tile, glass) but does not penetrate porous materials like drywall and wood, where mold roots (hyphae) remain and regrow. Improper removal also aerosolizes spores, spreading contamination to unaffected areas. IICRC-certified remediation requires containment, HEPA filtration, controlled demolition, and air quality verification.' },
        { q:'How long does mold remediation take?', a:'A typical single-room remediation takes 1–3 days. Larger mold infestations involving multiple rooms or structural elements can take 5–10 days. After remediation is complete, we recommend post-remediation air quality testing (by an independent industrial hygienist) to verify clearance before reconstruction begins.' },
        { q:'What causes mold in West Michigan homes?', a:'West Michigan\'s humid summers (Lake Michigan moisture), frequent freeze-thaw cycles, and aging housing stock create ideal mold conditions. Basement moisture intrusion, crawlspace humidity, bathroom exhaust failures, and unaddressed water damage are the most common causes we encounter.' },
    ];

    const faqSchema = faqs.map(f => ({
        '@type':'Question',
        name: f.q,
        acceptedAnswer:{ '@type':'Answer', text: f.a }
    }));

    return head({
        title: 'Mold Remediation West Michigan | Disaster Response by Ryan',
        desc:  'Mold in your West Michigan home? Disaster Response by Ryan provides IICRC-certified mold remediation — negative pressure containment, HEPA filtration, and verified clearance. Direct insurance billing. Call (616) 822-1978.',
        canonical: 'https://disaster911.net/mold-remediation/',
        svcLabel: 'Mold Remediation',
        faqSchema,
    }) + NAV('../') + `
    <section class="hero" style="padding:5rem 0 7rem;background:linear-gradient(135deg,#052e16 0%,#14532d 50%,#052e16 100%);">
        <div class="hero-overlay"></div>
        <div class="container hero-content" style="grid-template-columns:1fr;">
            <div class="hero-text center" style="margin:0 auto;max-width:750px;">
                <div style="display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:2rem;padding:.4rem 1rem;margin-bottom:1rem;font-size:.85rem;font-weight:600;">
                    <i class="fa-solid fa-circle-check" style="color:#6ee7b7;"></i> IICRC S520 Certified &bull; HEPA Filtration &bull; Clearance Verified
                </div>
                <h1 style="font-size:clamp(2rem,5vw,3rem);margin-bottom:1rem;">Certified Mold Remediation<br>Grand Rapids &amp; West Michigan</h1>
                <p class="subheadline" style="margin:0 auto 2rem;">Safe, complete mold removal following IICRC S520 protocol. Negative pressure containment. Air quality verified before we leave.</p>
                <div class="hero-actions" style="justify-content:center;">
                    <a href="tel:${PHONE_LINK}" class="btn btn-primary btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call ${PHONE_DISPLAY}</a>
                    <a href="sms:${SMS_LINK}" class="btn btn-secondary btn-large"><i class="fa-solid fa-comment-sms"></i> Text Us Now</a>
                </div>
            </div>
        </div>
    </section>

    <nav aria-label="Breadcrumb" style="background:var(--bg-light);border-bottom:1px solid var(--bg-subtle);padding:.6rem 0;font-size:.85rem;">
        <div class="container">
            <a href="../">Home</a> <span style="margin:0 .4rem;color:var(--text-muted);">/</span>
            <span style="color:var(--text-muted);">Mold Remediation</span>
        </div>
    </nav>

    <main style="padding:3rem 0;">
        <div class="container">
            <div class="hub-layout">
                <div>
                    <p class="lead">West Michigan's humidity, clay-heavy soils, and aging housing stock make mold a common — and serious — problem for local homeowners. Mold doesn't just look bad. Left unaddressed, it degrades structural materials, contaminates HVAC systems, and can cause respiratory and health issues, especially in children and elderly residents.</p>
                    <p>Disaster Response by Ryan follows the IICRC S520 Standard for Professional Mold Remediation on every job. This means proper containment, HEPA filtration, controlled removal, and post-remediation verification — not just wiping visible mold with bleach and calling it done.</p>

                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:2rem; margin:2.5rem 0;">
                        <div style="display:flex; gap:1.5rem; align-items:start;">
                            <div style="background:#fff; padding:1rem; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                                <i class="fa-solid fa-leaf" style="color:#15803d; font-size:1.75rem;"></i>
                            </div>
                            <div>
                                <h3 style="margin:0 0 0.5rem; color:#14532d; font-size:1.2rem;">Holistic & Hypersensitive Mold Remediation</h3>
                                <p style="margin:0; font-size:0.95rem; line-height:1.6; color:#14532d;">
                                    For our hypersensitive clients, we partner with <strong>Lisa</strong> at <a href="https://www.wellabode.com/about" target="_blank" rel="noopener" style="color:#14532d; font-weight:700; text-decoration:underline;">Well Abode</a>. 
                                    Lisa is a Building Biologist who specializes in creating safe environments for those with CIRS (Chronic Inflammatory Response Syndrome) and mold sensitivities. 
                                    <strong>Lisa leads the protocol writing</strong> for these cases, which our team executes with surgical precision to ensure your home is truly safe for everyone.
                                </p>
                            </div>
                        </div>
                    </div>

                    <h2 style="margin-top:2.5rem;">Why Improper Mold Removal Makes Things Worse</h2>
                    <p>Disturbing mold without containment releases millions of spores into the air, spreading contamination to previously clean areas and into your HVAC system. Bleach doesn't kill mold on porous materials like drywall and wood — mold roots (hyphae) penetrate deep into the material and survive surface treatment. Professional remediation requires physical containment, HEPA air scrubbing, and controlled demolition of affected materials.</p>

                    <h2 style="margin-top:2rem;">Our IICRC S520 Mold Remediation Process</h2>
                    <ol style="display:flex;flex-direction:column;gap:1rem;padding-left:1.25rem;margin-top:1rem;">
                        <li><strong>Moisture Inspection:</strong> We use thermal imaging and calibrated moisture meters to identify not just visible mold but the moisture source driving it — because without fixing the source, mold returns.</li>
                        <li><strong>Negative Pressure Containment:</strong> We build plastic containment barriers isolating the work area, then run HEPA air scrubbers in negative pressure mode — so air flows from clean areas into the work zone, not the other direction.</li>
                        <li><strong>HEPA Air Filtration:</strong> Commercial HEPA air scrubbers filter mold spores from the work zone air continuously throughout the job, capturing particles as small as 0.3 microns.</li>
                        <li><strong>Controlled Demolition:</strong> Affected drywall, insulation, and other porous materials are carefully removed in contained sections to prevent spore dispersal, then bagged and disposed of per EPA guidelines.</li>
                        <li><strong>Antimicrobial Treatment:</strong> Exposed structural surfaces are cleaned and treated with EPA-registered antimicrobial agents that eliminate residual mold and inhibit regrowth.</li>
                        <li><strong>Clearance Verification &amp; Reconstruction:</strong> We verify remediation is complete before reconstruction begins. Using our Michigan Builder's License, we rebuild affected areas back to pre-loss condition.</li>
                    </ol>

                    ${photoGrid(PHOTOS.mold.slice(0,3))}

                    <h2 style="margin-top:2rem;">Common Causes of Mold in West Michigan Homes</h2>
                    <div class="hub-2col">
                        ${[
                            ['fa-house-flood-water','Basement Moisture Intrusion','Hydrostatic pressure in West Michigan\'s clay soils forces water through foundation walls and floor cracks, creating persistently wet basement environments.'],
                            ['fa-water','Crawlspace Humidity','Unencapsulated crawlspaces with dirt floors and poor vapor barriers are common mold sources, distributing spores through floor framing into living areas.'],
                            ['fa-droplet','Unresolved Water Damage','Water damage not professionally dried within 48 hours almost always results in mold growth inside wall cavities and under flooring.'],
                            ['fa-wind','Poor Bathroom Ventilation','Exhaust fans that vent into attic spaces rather than to the exterior cause mold to grow on attic decking and roof framing.'],
                        ].map(([icon,title,text]) => `
                        <div style="background:var(--bg-light);border-radius:var(--radius-md);padding:1.25rem;">
                            <div style="font-weight:700;margin-bottom:.4rem;display:flex;align-items:center;gap:.5rem;"><i class="fa-solid ${icon}" style="color:#2d6a4f;"></i> ${title}</div>
                            <p style="font-size:.9rem;margin:0;color:var(--text-muted);">${text}</p>
                        </div>`).join('')}
                    </div>

                    ${photoGrid([PHOTOS.mold[3]])}

                    ${ctaStrip('Found Mold in Your Home?','Don\'t disturb it. Call us first — we\'ll assess safely and explain your options at no obligation.')}

                    <h2>Mold &amp; Your Insurance Claim</h2>
                    <p>Mold resulting from a covered water loss is typically a covered claim. We document the connection between the original water event and the resulting mold growth — photos, moisture logs, and scope of work — to support your claim with your adjuster. Direct billing to all major carriers.</p>

                    ${reviewCard('Called about a musty smell in the basement — Ryan came out the same week, found mold behind the drywall, walked us through the entire process, removed it safely, and gave tips to prevent it coming back. Super knowledgeable and easy to work with.','K. DeVries','Mold remediation — Grand Rapids, MI')}

                    <h2 style="margin-top:2rem;">Frequently Asked Questions</h2>
                    <div style="margin-top:1rem;">
                        ${faqs.map(f => faqItem(f.q, f.a)).join('')}
                    </div>
                </div>
                ${sidebar('../')}
            </div>
        </div>
    </main>

    ${cityGrid('mold-remediation')}

    ${FOOTER('../')}
</body>
</html>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEWAGE CLEANUP HUB
═══════════════════════════════════════════════════════════════════════════ */
function buildSewage() {
    const faqs = [
        { q:'Is sewage backup dangerous to my health?', a:'Yes. Sewage is classified as Category 3 "black water" — the most hazardous water category defined by the IICRC. It contains bacteria (E. coli, Salmonella), viruses, and parasites. Direct contact causes illness. Do not attempt to clean it yourself without proper PPE. Vacate the affected area and call us immediately.' },
        { q:'Will my homeowner\'s insurance cover sewage backup?', a:'Sewage backup coverage depends on your specific policy. Many standard policies exclude sewer backup unless you\'ve purchased a specific endorsement. We document everything — the source, the extent, and the remediation scope — for your claim. We work directly with all major carriers and can help you navigate the coverage question with your adjuster.' },
        { q:'How quickly do you need to respond to a sewage backup?', a:'Immediately. Sewage contains pathogens that begin affecting porous building materials within hours. The longer sewage sits, the deeper it penetrates flooring, subfloor, wall bases, and framing. Materials that could be cleaned and dried if treated within hours may need full demolition and replacement if sewage sits for 24+ hours.' },
        { q:'What does sewage cleanup actually involve?', a:'We wear full protective gear — Tyvek suits, respirators, gloves — and extract all sewage using specialized equipment. All affected porous materials (drywall, insulation, carpet, padding) are removed and disposed of per biohazard protocol. Structural surfaces are cleaned with EPA-registered disinfectants, treated with antimicrobial agents, and dried to IICRC standards before reconstruction.' },
        { q:'Can my home be saved after a sewage backup?', a:'In almost all cases, yes. The key is speed. We have handled major Category 3 sewage losses involving multiple rooms and even entire basements. Hard surfaces, concrete, and structural framing can be disinfected and restored. Porous materials that have absorbed sewage are removed and replaced. We rebuild everything with our Michigan Builder\'s License.' },
        { q:'What causes sewage backups in West Michigan?', a:'The most common causes are main sewer line blockages (tree roots, debris), aging municipal infrastructure, combined sewer overflows during heavy rain events, and failed sump systems that allow storm water to enter sanitary lines. Older neighborhoods in Grand Rapids, Muskegon, and Holland are particularly susceptible due to clay tile sewer laterals from the mid-1900s.' },
    ];

    const faqSchema = faqs.map(f => ({
        '@type':'Question',
        name: f.q,
        acceptedAnswer:{ '@type':'Answer', text: f.a }
    }));

    return head({
        title: 'Sewage Cleanup West Michigan | Disaster Response by Ryan',
        desc:  'Sewage backup in West Michigan? Disaster Response by Ryan provides Category 3 biohazard cleanup 24/7. Full extraction, disinfection, and reconstruction. Direct insurance billing. Call (616) 822-1978.',
        canonical: 'https://disaster911.net/sewage-cleanup/',
        svcLabel: 'Sewage Cleanup',
        faqSchema,
    }) + NAV('../') + `
    <section class="hero" style="padding:5rem 0 7rem;background:linear-gradient(135deg,#1c0a00 0%,#431407 50%,#1c0a00 100%);">
        <div class="hero-overlay"></div>
        <div class="container hero-content" style="grid-template-columns:1fr;">
            <div class="hero-text center" style="margin:0 auto;max-width:750px;">
                <div style="display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:2rem;padding:.4rem 1rem;margin-bottom:1rem;font-size:.85rem;font-weight:600;">
                    <i class="fa-solid fa-circle-check" style="color:#6ee7b7;"></i> Category 3 Biohazard &bull; Full PPE &bull; Direct Insurance Billing
                </div>
                <h1 style="font-size:clamp(2rem,5vw,3rem);margin-bottom:1rem;">Sewage Backup Cleanup<br>&amp; Biohazard Removal — West Michigan</h1>
                <p class="subheadline" style="margin:0 auto 2rem;">Do not attempt to clean sewage yourself. Category 3 biohazard. We respond 24/7 with full PPE and proper extraction equipment.</p>
                <div class="hero-actions" style="justify-content:center;">
                    <a href="tel:${PHONE_LINK}" class="btn btn-primary btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call ${PHONE_DISPLAY}</a>
                    <a href="sms:${SMS_LINK}" class="btn btn-secondary btn-large"><i class="fa-solid fa-comment-sms"></i> Text Us Now</a>
                </div>
            </div>
        </div>
    </section>

    <nav aria-label="Breadcrumb" style="background:var(--bg-light);border-bottom:1px solid var(--bg-subtle);padding:.6rem 0;font-size:.85rem;">
        <div class="container">
            <a href="../">Home</a> <span style="margin:0 .4rem;color:var(--text-muted);">/</span>
            <span style="color:var(--text-muted);">Sewage Cleanup</span>
        </div>
    </nav>

    <main style="padding:3rem 0;">
        <div class="container">
            <div class="hub-layout">
                <div>
                    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:var(--radius-md);padding:1.25rem 1.5rem;margin-bottom:2rem;display:flex;gap:.75rem;align-items:flex-start;">
                        <i class="fa-solid fa-triangle-exclamation" style="color:#dc2626;font-size:1.3rem;flex-shrink:0;margin-top:.1rem;"></i>
                        <div>
                            <strong style="color:#7f1d1d;">Do Not Attempt to Clean Sewage Yourself</strong>
                            <p style="margin:.3rem 0 0;font-size:.9rem;color:#7f1d1d;">Sewage is a Category 3 biohazard containing bacteria, viruses, and parasites. Exposure without proper PPE causes serious illness. Vacate the affected area and call us immediately at <a href="tel:${PHONE_LINK}" style="color:#7f1d1d;font-weight:700;">${PHONE_DISPLAY}</a>.</p>
                        </div>
                    </div>

                    <p class="lead">A sewage backup is one of the most urgent restoration emergencies a homeowner can face. Beyond the obvious disruption, it represents a serious health hazard — Category 3 "black water" contaminated with pathogens that require proper biohazard protocols, not a mop and bucket.</p>
                    <p>Disaster Response by Ryan responds to sewage backup emergencies across West Michigan 24/7. Our team arrives in full PPE, extracts all sewage, removes and properly disposes of contaminated materials, disinfects structural surfaces with EPA-registered products, and dries and rebuilds the affected area to pre-loss condition.</p>

                    <h2 style="margin-top:2.5rem;">Why Speed Is Critical</h2>
                    <p>Sewage doesn't just sit on top of surfaces — it wicks into drywall, insulation, subfloor sheathing, and framing within hours. Materials that can be disinfected and saved with prompt response require full demolition and replacement if sewage has saturated them. Mold can begin growing in sewage-contaminated materials within 24 hours. The faster we arrive, the more of your home we can save.</p>

                    <h2 style="margin-top:2rem;">Our Sewage Cleanup Process</h2>
                    <ol style="display:flex;flex-direction:column;gap:1rem;padding-left:1.25rem;margin-top:1rem;">
                        <li><strong>Immediate Containment:</strong> We establish containment to prevent sewage contamination from spreading to unaffected areas of your home. All HVAC registers in the affected zone are sealed to prevent pathogen distribution.</li>
                        <li><strong>Sewage Extraction:</strong> Specialized extractors remove all sewage from the affected area. Standing sewage must be removed before any cleaning or assessment can begin.</li>
                        <li><strong>Contaminated Material Removal:</strong> All porous materials that have absorbed sewage — drywall, insulation, carpet, pad, flooring — are removed and disposed of as biohazard waste. This is not optional: no amount of disinfection renders sewage-saturated drywall safe.</li>
                        <li><strong>Structural Disinfection:</strong> Exposed concrete, framing, and hard surfaces are cleaned and treated with EPA-registered disinfectants, followed by application of antimicrobial sealers.</li>
                        <li><strong>Drying &amp; Air Quality:</strong> After disinfection, the structural cavity is dried to IICRC standards using Phoenix air movers and dehumidifiers. Air quality monitoring confirms contamination has been addressed.</li>
                        <li><strong>Reconstruction:</strong> We rebuild the affected area completely — subfloor, drywall, insulation, flooring, trim — using our Michigan Builder's License, bringing your home back to pre-loss condition.</li>
                    </ol>

                    ${photoGrid(PHOTOS.sewage)}

                    <h2 style="margin-top:2rem;">Common Causes of Sewage Backups in West Michigan</h2>
                    <div class="hub-2col">
                        ${[
                            ['fa-tree','Tree Root Intrusion','The most common cause of sewage lateral failure. Roots from mature trees (particularly willows and maples) seek moisture and enter clay tile sewer lines through joints, eventually blocking flow.'],
                            ['fa-cloud-showers-heavy','Combined Sewer Overloads','During heavy rain events, older combined sewer systems can overflow, forcing sewage backup into homes through floor drains and low-lying fixtures.'],
                            ['fa-wrench','Aging Infrastructure','Many West Michigan neighborhoods have clay tile sewer laterals installed in the 1940s–1970s. These crack, shift, and collapse as they age, causing repeated backup events.'],
                            ['fa-faucet','Blocked Main Line','Grease buildup, debris, and foreign objects (wipes, paper towels) can block the main sewer line, causing all lower-level drains to back up simultaneously.'],
                        ].map(([icon,title,text]) => `
                        <div style="background:var(--bg-light);border-radius:var(--radius-md);padding:1.25rem;">
                            <div style="font-weight:700;margin-bottom:.4rem;display:flex;align-items:center;gap:.5rem;"><i class="fa-solid ${icon}" style="color:#92400e;"></i> ${title}</div>
                            <p style="font-size:.9rem;margin:0;color:var(--text-muted);">${text}</p>
                        </div>`).join('')}
                    </div>

                    ${ctaStrip('Sewage Backup Right Now?','This is a biohazard emergency. We respond 24/7 with full PPE and proper equipment.')}

                    <h2>Sewage Cleanup &amp; Your Insurance Claim</h2>
                    <p>Sewage backup coverage varies by policy. Many standard policies exclude sewer backup unless a specific endorsement was purchased. We document everything — source identification, scope of contamination, materials removed, disinfection applied, and drying achieved — to give your adjuster a complete picture. We bill all major carriers directly.</p>

                    ${reviewCard('The whole team at Disaster Response is top notch. When we had a need, they were prompt and professional to take care of everything. Couldn\'t be more satisfied.','D. Hoekstra','Emergency response — West Michigan')}

                    <h2 style="margin-top:2rem;">Frequently Asked Questions</h2>
                    <div style="margin-top:1rem;">
                        ${faqs.map(f => faqItem(f.q, f.a)).join('')}
                    </div>
                </div>
                ${sidebar('../')}
            </div>
        </div>
    </main>

    ${cityGrid('sewage-cleanup')}

    ${FOOTER('../')}
</body>
</html>`;
}

/* ── Write all 4 hub pages ──────────────────────────────────────────────── */
const PAGES = [
    { dir: 'water-damage-restoration', build: buildWater },
    { dir: 'fire-damage-restoration',  build: buildFire  },
    { dir: 'mold-remediation',         build: buildMold  },
    { dir: 'sewage-cleanup',           build: buildSewage },
];

for (const { dir, build } of PAGES) {
    const outPath = path.join(BASE, dir, 'index.html');
    fs.writeFileSync(outPath, build(), 'utf8');
    console.log(`✅  Written: ${dir}/index.html`);
}

console.log('\n✅  All 4 hub pages rebuilt successfully.');
