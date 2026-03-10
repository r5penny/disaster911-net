/**
 * rebuild-city-pages.js
 * Rebuilds all 204 city pages.
 * — Unique content per page (4 rotating variants per service)
 * — Real job photos spread across all pages
 * — No "Ryan answers" language
 * — Call + Text CTAs everywhere
 * Run: node rebuild-city-pages.js
 */

const fs   = require('fs');
const path = require('path');
const CITIES_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'cities.json'), 'utf8'));

// ─── CITY DATA ────────────────────────────────────────────────────────────────
const CITIES = [
  { slug:'ada-mi',              name:'Ada',              county:'Kent',     minutes:15 },
  { slug:'allendale-mi',        name:'Allendale',         county:'Ottawa',   minutes:15 },
  { slug:'alpine-mi',           name:'Alpine',            county:'Kent',     minutes:10 },
  { slug:'blendon-mi',          name:'Blendon',           county:'Ottawa',   minutes:20 },
  { slug:'byron-center-mi',     name:'Byron Center',      county:'Kent',     minutes:20 },
  { slug:'caledonia-mi',        name:'Caledonia',         county:'Kent',     minutes:25 },
  { slug:'cascade-mi',          name:'Cascade',           county:'Kent',     minutes:15 },
  { slug:'cedar-springs-mi',    name:'Cedar Springs',     county:'Kent',     minutes:35 },
  { slug:'chester-mi',          name:'Chester',           county:'Eaton',    minutes:30 },
  { slug:'comstock-park-mi',    name:'Comstock Park',     county:'Kent',     minutes:10 },
  { slug:'coopersville-mi',     name:'Coopersville',      county:'Ottawa',   minutes:25 },
  { slug:'cutlerville-mi',      name:'Cutlerville',       county:'Kent',     minutes:20 },
  { slug:'dorr-mi',             name:'Dorr',              county:'Allegan',  minutes:30 },
  { slug:'east-grand-rapids-mi',name:'East Grand Rapids', county:'Kent',     minutes:15 },
  { slug:'ferrysburg-mi',       name:'Ferrysburg',        county:'Ottawa',   minutes:40 },
  { slug:'forest-hills-mi',     name:'Forest Hills',      county:'Kent',     minutes:15 },
  { slug:'fruitport-mi',        name:'Fruitport',         county:'Muskegon', minutes:40 },
  { slug:'gaines-mi',           name:'Gaines',            county:'Kent',     minutes:25 },
  { slug:'georgetown-mi',       name:'Georgetown',        county:'Ottawa',   minutes:20 },
  { slug:'grand-haven-mi',      name:'Grand Haven',       county:'Ottawa',   minutes:40 },
  { slug:'grand-rapids-mi',     name:'Grand Rapids',      county:'Kent',     minutes:12 },
  { slug:'grandville-mi',       name:'Grandville',        county:'Kent',     minutes:15 },
  { slug:'grant-mi',            name:'Grant',             county:'Newaygo',  minutes:50 },
  { slug:'greenville-mi',       name:'Greenville',        county:'Montcalm', minutes:45 },
  { slug:'hastings-mi',         name:'Hastings',          county:'Barry',    minutes:45 },
  { slug:'holland-mi',          name:'Holland',           county:'Ottawa',   minutes:35 },
  { slug:'hudsonville-mi',      name:'Hudsonville',       county:'Ottawa',   minutes:20 },
  { slug:'ionia-mi',            name:'Ionia',             county:'Ionia',    minutes:45 },
  { slug:'jamestown-mi',        name:'Jamestown',         county:'Ottawa',   minutes:20 },
  { slug:'jenison-mi',          name:'Jenison',           county:'Ottawa',   minutes:15 },
  { slug:'kent-city-mi',        name:'Kent City',         county:'Kent',     minutes:35 },
  { slug:'kentwood-mi',         name:'Kentwood',          county:'Kent',     minutes:20 },
  { slug:'lowell-mi',           name:'Lowell',            county:'Kent',     minutes:25 },
  { slug:'montague-mi',         name:'Montague',          county:'Muskegon', minutes:55 },
  { slug:'moorland-mi',         name:'Moorland',          county:'Muskegon', minutes:30 },
  { slug:'muskegon-mi',         name:'Muskegon',          county:'Muskegon', minutes:45 },
  { slug:'norton-shores-mi',    name:'Norton Shores',     county:'Muskegon', minutes:45 },
  { slug:'plainfield-mi',       name:'Plainfield',        county:'Kent',     minutes:10 },
  { slug:'port-sheldon-mi',     name:'Port Sheldon',      county:'Ottawa',   minutes:30 },
  { slug:'ravenna-mi',          name:'Ravenna',           county:'Muskegon', minutes:40 },
  { slug:'rockford-mi',         name:'Rockford',          county:'Kent',     minutes:20 },
  { slug:'sparta-mi',           name:'Sparta',            county:'Kent',     minutes:30 },
  { slug:'spring-lake-mi',      name:'Spring Lake',       county:'Ottawa',   minutes:40 },
  { slug:'sullivan-mi',         name:'Sullivan',          county:'Muskegon', minutes:35 },
  { slug:'tallmadge-mi',        name:'Tallmadge',         county:'Ottawa',   minutes:20 },
  { slug:'walker-mi',           name:'Walker',            county:'Kent',     minutes:5  },
  { slug:'wayland-mi',          name:'Wayland',           county:'Allegan',  minutes:35 },
  { slug:'whitehall-mi',        name:'Whitehall',         county:'Muskegon', minutes:55 },
  { slug:'wright-mi',           name:'Wright',            county:'Ottawa',   minutes:25 },
  { slug:'wyoming-mi',          name:'Wyoming',           county:'Kent',     minutes:15 },
  { slug:'zeeland-mi',          name:'Zeeland',           county:'Ottawa',   minutes:30 },
];

// ─── PHOTOS ───────────────────────────────────────────────────────────────────
const ALL_PHOTOS = [
  { src:'moisture-meter-bathroom-tile-water-damage-grand-rapids.jpg',        alt:'Moisture meter detecting water damage beneath bathroom tile' },
  { src:'moisture-meter-999-water-damage-wall-inspection-grand-rapids.jpg',   alt:'Moisture meter reading 999 during wall inspection' },
  { src:'moisture-meter-ceiling-water-damage-detection-grand-rapids.jpg',    alt:'Moisture meter detecting ceiling water damage' },
  { src:'moisture-meter-crown-molding-water-damage-grand-rapids.jpg',        alt:'Moisture detected in crown molding after water damage' },
  { src:'phoenix-dehumidifier-water-damage-bathroom-grand-rapids.jpg',       alt:'Phoenix commercial dehumidifier running in water-damaged bathroom' },
  { src:'water-damage-drying-equipment-bathroom-grand-rapids-mi.jpg',        alt:'Professional drying equipment deployed in bathroom' },
  { src:'air-mover-structural-drying-living-room-grand-rapids-mi.jpg',       alt:'Air mover structural drying in living room' },
  { src:'structural-drying-air-movers-living-room-grand-rapids.jpg',         alt:'Multiple air movers set up for structural drying' },
  { src:'iicrc-water-damage-structural-drying-grand-rapids-mi.jpg',          alt:'IICRC certified structural drying setup' },
  { src:'water-damage-restoration-drying-equipment-grand-rapids.jpg',        alt:'Commercial drying equipment deployed after water damage' },
  { src:'water-damage-restoration-living-room-equipment-grand-rapids.jpg',   alt:'Full water damage restoration equipment in living room' },
  { src:'water-damage-air-mover-drying-bedroom-middleville-mi.jpg',          alt:'Air mover drying setup in bedroom after water damage' },
  { src:'water-damage-bedroom-containment-middleville-mi.jpg',               alt:'Bedroom containment setup during water damage restoration' },
  { src:'water-damage-containment-barrier-middleville-mi.jpg',               alt:'Professional containment barrier protecting home during restoration' },
  { src:'water-damage-containment-hallway-middleville-mi.jpg',               alt:'Hallway containment during water damage restoration' },
  { src:'water-damage-containment-wall-middleville-mi.jpg',                  alt:'IICRC containment wall installed during water damage job' },
  { src:'fire-damage-restoration-bedroom-soot-grand-rapids-mi.jpg',          alt:'Fire and smoke damage — soot-covered walls and ceiling after house fire, Grand Rapids, MI' },
  { src:'fire-damage-char-ceiling-structural-grand-rapids-mi.jpg',           alt:'Char damage to ceiling and exposed structural framing after house fire — Grand Rapids, MI' },
  { src:'fire-damage-room-total-loss-grand-rapids-mi.jpg',                   alt:'Total loss fire damage — burned room interior after structural fire, Grand Rapids, MI' },
  { src:'fire-damage-smoke-soot-interior-grand-rapids-mi.jpg',               alt:'Smoke and soot covering interior walls and contents after fire — Grand Rapids, MI' },
  { src:'fire-damage-kitchen-soot-grand-rapids-mi.jpg',                      alt:'Fire damage in kitchen — soot-covered cabinets and surfaces, Grand Rapids, MI' },
  { src:'fire-damage-burned-structure-grand-rapids-mi.jpg',                  alt:'Burned structural framing after fire — fire damage restoration job site, Grand Rapids, MI' },
];

// Photos assigned per service (indices into ALL_PHOTOS)
const SERVICE_PHOTO_SETS = {
  'water-damage-restoration': [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  'fire-damage-restoration':  [16,17,18,19,20,21],
  'mold-remediation':         [0,1,12,13,14,15,2,3],
  'sewage-cleanup':           [12,13,14,15,6,7,8,9],
};

function getPhotos(svcSlug, cityIdx, count = 3) {
  const pool   = SERVICE_PHOTO_SETS[svcSlug];
  const photos = [];
  for (let i = 0; i < count; i++) {
    photos.push(ALL_PHOTOS[pool[(cityIdx + i) % pool.length]]);
  }
  return photos;
}

function faqItemHTML(q, a) {
  return `
<div class="faq-item">
  <button class="faq-question">
    ${q}
    <i class="fa-solid fa-chevron-down" style="font-size:0.8rem; opacity:0.6;"></i>
  </button>
  <div class="faq-answer">
    <div>
      <p style="margin:0;">${a}</p>
    </div>
  </div>
</div>`;
}

function photoStripHTML(photos, cityName) {


  return `
<div style="margin:2rem 0;">
  <p style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin-bottom:.75rem;">Real Job Photos — ${cityName}, MI</p>
  <div style="display:grid;grid-template-columns:repeat(${photos.length},1fr);gap:.75rem;">
    ${photos.map(p => `
    <div style="border-radius:var(--radius-md);overflow:hidden;aspect-ratio:4/3;box-shadow:var(--shadow-md);">
      <img src="/images/${p.src}" alt="${p.alt} — ${cityName}, MI" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
    </div>`).join('')}
  </div>
</div>`;
}

// ─── CONTENT VARIANTS ─────────────────────────────────────────────────────────
// Each service has 4 rotating content variants so no two pages are identical.

function waterBody(c, v) {
  const {name, county, minutes} = c;

  const openings = [
    `<p class="lead">When water enters your ${name} home or business, the clock starts immediately — mold can colonize within 24 hours, wood floors warp within 48, and drywall turns to pulp within 72. Our IICRC-certified team dispatches from Walker, MI and arrives in approximately ${minutes} minutes, equipped to stop secondary damage before it compounds.</p><p>We serve all of ${county} County 24 hours a day, every day. No dispatch center, no hold queue. Ryan, Steve, Shawn, and Rigaberto — the same four people from assessment through reconstruction.</p>`,
    `<p class="lead">Water doesn't stop when the source stops — moisture continues wicking through drywall, insulation, and wood framing long after the obvious damage is visible. ${county} County homeowners in ${name} and surrounding areas know Michigan winters and spring snowmelt create real flood risk. Our team arrives in approximately ${minutes} minutes and gets to work immediately with thermal imaging, extraction, and commercial drying systems.</p><p>Family-owned since 1981. IICRC certified. Michigan Builder's License. No franchise overhead — just the same core team on every job.</p>`,
    `<p class="lead">Most ${name} homeowners underestimate how fast water damage escalates. A small basement leak becomes a mold problem within 48 hours. A burst pipe that soaks drywall requires professional drying to confirmed moisture readings — not a fan and a prayer. Our certified crew is on-site in approximately ${minutes} minutes from Walker, MI with the right equipment to do this correctly the first time.</p><p>We bill your insurance directly and prepare full Xactimate documentation. You deal with your family — we deal with your adjuster.</p>`,
    `<p class="lead">Water damage restoration in ${name} requires speed, the right equipment, and an IICRC-certified team that knows the difference between Category 1 clean water and Category 3 black water. Our Walker, MI headquarters puts us approximately ${minutes} minutes from ${name} — close enough to be on scene before a situation becomes a catastrophe. Structural drying to IICRC standards. Daily moisture monitoring. No job closed until dry goals are confirmed.</p><p>${county} County families have trusted this family business since 1981. The same team handles every job from first contact to final walkthrough.</p>`,
  ];

  const processIntros = [
    `<h2>What Happens When Our Team Arrives in ${name}</h2>`,
    `<h2>Our Water Damage Response Process for ${name} Homeowners</h2>`,
    `<h2>The IICRC-Certified Process We Follow in ${name}</h2>`,
    `<h2>Step-by-Step: How We Handle Water Damage in ${name}, MI</h2>`,
  ];

  const causeIntros = [
    `<h2>Common Water Damage Causes in ${name}, MI</h2><p>Michigan's climate creates specific risks for ${county} County homeowners:</p>`,
    `<h2>Why ${name} Homes Get Water Damage</h2><p>West Michigan's weather patterns and soil conditions mean ${county} County homes face unique water intrusion risks:</p>`,
    `<h2>Water Damage Risks Specific to ${name}, MI</h2><p>In ${county} County, these are the most common causes we respond to:</p>`,
    `<h2>What Causes Water Damage in ${name} — And What We Do About It</h2><p>Every water damage event in ${name} has a cause that must be identified and addressed — not just dried over. Common culprits in ${county} County:</p>`,
  ];

  const faqs = [
    [
      faqItemHTML(`How fast can you get to ${name}?`, `We dispatch immediately from Walker, MI — approximately ${minutes} minutes from ${name} under normal driving conditions. We are available 24 hours a day, 365 days a year including all holidays.`),
      faqItemHTML(`Will my homeowner's insurance cover this?`, `Most policies cover sudden and accidental water damage — burst pipes, appliance failures, storm-driven rain through a damaged roof. Flood damage from rising water outside requires a separate NFIP flood policy. We clarify your coverage on the first visit and document everything your adjuster needs.`),
      faqItemHTML(`How long does water damage restoration take?`, `Structural drying takes 3–5 days for most jobs, depending on material types and saturation level. We monitor daily with moisture meters and remove equipment only when IICRC dry goals are confirmed. Reconstruction timeline depends on scope.`),
      faqItemHTML(`Can I stay in my home during restoration?`, `In most cases, yes — we work around your schedule and keep living areas clear. For Category 3 sewage events or large-scale demolition, temporary displacement may be necessary. We discuss this upfront so there are no surprises.`),
    ],
    [
      faqItemHTML(`Can water damage lead to mold in ${name}?`, `Yes — mold can begin growing within 24–48 hours of water intrusion, particularly in Michigan's humid summers. Professional drying to IICRC moisture standards is the only reliable way to prevent mold growth. If mold is already present, we offer full remediation as well.`),
      faqItemHTML(`What equipment do you use for water damage?`, `Truck-mount extractors for standing water removal, Phoenix commercial LGR dehumidifiers, high-velocity air movers, thermal imaging cameras for hidden moisture detection, and calibrated moisture meters for daily documentation. We carry more equipment than most restoration companies our size.`),
      faqItemHTML(`Do you handle reconstruction after water damage?`, `Yes — our Michigan Builder's License covers full structural reconstruction: drywall, insulation, flooring, cabinetry, and painting. One company, one contract, start to finish. No separate general contractor needed after we dry the structure.`),
      faqItemHTML(`What carriers do you bill directly in ${name}?`, `State Farm, Allstate, Farmers, Liberty Mutual, USAA, Nationwide, Travelers, Auto-Owners, and all major carriers. We prepare Xactimate estimates that match adjuster expectations — no back-and-forth, no supplemental fights.`),
    ],
    [
      faqItemHTML(`What's the difference between mitigation and restoration?`, `Mitigation is stopping and drying the damage. Restoration is rebuilding to pre-loss condition. Many companies only do mitigation and hand you off to a separate contractor for the rebuild. We hold a Michigan Builder's License and do both — one contract, no handoff, no coordination gaps.`),
      faqItemHTML(`How do I know when the drying is complete?`, `We use calibrated moisture meters to take daily readings and log them. Drying is complete when all materials reach IICRC-standard dry goals — specific moisture content targets for each material type. We never close a job based on visual inspection alone.`),
      faqItemHTML(`Is there a risk of mold if we start restoration quickly?`, `Rapid response and thorough drying are the best mold prevention. The faster we extract water and begin structural drying, the less time mold has to establish. This is exactly why 24/7 emergency response matters — a 12-hour delay can mean the difference between a drying job and a mold remediation job.`),
      faqItemHTML(`What should I do before you arrive?`, `Call us first — (616) 822-1978 or text. While you wait: turn off the water source if safe to do so, shut off electricity to affected areas, remove valuables from the floor, and do not use a household vacuum on standing water. We'll give you specific guidance on the phone.`),
    ],
    [
      faqItemHTML(`Do you serve ${name} on weekends and holidays?`, `Yes — 24 hours a day, 365 days a year. Water damage doesn't respect business hours and neither do we. There is no premium charge for nights, weekends, or holidays.`),
      faqItemHTML(`How does your insurance billing process work?`, `We document everything from the first assessment — photos, moisture readings, scope of damage — and prepare a complete Xactimate estimate. We submit directly to your carrier and follow up with the adjuster. In most cases you pay only your deductible and we handle the rest of the billing directly.`),
      faqItemHTML(`How is your company different from a national franchise?`, `We're a second-generation family business, not a franchise. No 800 number. No corporate margin skimming your restoration budget. The owner is involved in every job. The same crew that assesses your damage does the drying and the reconstruction — accountability that franchise models can't offer.`),
      faqItemHTML(`What does IICRC certified mean?`, `IICRC (Institute of Inspection, Cleaning and Restoration Certification) is the global standard-setting organization for the restoration industry. Certified technicians have completed rigorous training and testing in water damage, mold, fire, and structural drying science. It means the work is done according to industry standards — not guesswork.`),
    ],
  ];

  const quotes = [
    `"Ryan Penny and Disaster Response went above and beyond. When my basement flooded, Ryan came over within an hour. Exceptional, reliable, expert service."`,
    `"Ryan and his crew were phenomenal — professional, on time every morning, cleaned up every day. Would highly recommend to anyone."`,
    `"Extremely thorough and professional. Called in the morning, they were at my place before noon. Very knowledgeable."`,
    `"The whole team at Disaster Response is top notch. Prompt, professional, took care of everything."`,
  ];

  const photos = getPhotos('water-damage-restoration', v * 13, 3); // spread photos



  const extra = CITIES_DATA.find(x => x.id === c.slug) || { hook: 'Local topography significantly impacts property moisture. Contact Disaster Response for hyper-local assessment.', risk: 'Pipe bursts, drainage issues, appliance failures.' };
  const geoHTML = `
<div class="neo-card" style="margin:3.5rem 0; padding:3rem; background: var(--bg-white); border-left:5px solid var(--primary); box-shadow:var(--shadow-xl); border-radius:16px;">
  <div style="display:flex; align-items:center; gap:1.25rem; margin-bottom:1.5rem;">
    <div style="background:rgba(220, 38, 38, 0.1); padding:1rem; border-radius:12px; color:var(--primary);">
      <i class="fa-solid fa-map-location-dot fa-2x"></i>
    </div>
    <h2 style="color: #fff; margin:0; font-size:2rem;">Local Geography & Risks in ${name}</h2>
  </div>
  <p class="lead" style="font-size:1.15rem; line-height:1.7; color:var(--text-muted);">${extra.hook}</p>
  
  <div style="margin-top:2rem; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); padding:2rem; border-radius:12px;">
    <h3 style="margin-top:0; margin-bottom:1rem; font-size:1.3rem; color: var(--accent-orange); border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.75rem;">Specific ${county} County Constraints</h3>
    <p style="font-weight:600; font-size:1.1rem; color:#fff; margin:0; line-height:1.6;"><i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-yellow); margin-right:0.5rem;"></i> ${extra.risk}</p>
  </div>
  
  <p style="margin-top:2.5rem; font-size:1rem; color:var(--text-muted); line-height:1.8; padding-top:1.5rem; border-top:1px solid rgba(255,255,255,0.05);">Our Walker, MI headquarters is approximately ${minutes} minutes from ${name}. This precise proximity is critical. It allows our IICRC-certified emergency team to navigate ${county} County direct routes to reach your property before the 24-hour microbial threshold is crossed. Because we understand the exact environmental pressures of ${name} — whether dealing with clay soil hydrostatic pressure, local watershed flooding, or architectural age factors — our mitigation strategy prevents unnecessary demolition and drastically reduces your restoration costs. We do not use the same boilerplate drying approach for a Heritage Hill historic home that we would for a 1990s build in ${name}; our science is customized to your geography.</p>
</div>`;

  return `
${geoHTML}
<h2>${v === 0 ? 'Emergency Water Damage Response for' : v === 1 ? 'Professional Water Damage Restoration in' : v === 2 ? 'Fast Water Damage Cleanup Serving' : 'IICRC-Certified Water Damage Service for'} ${name}, MI</h2>
${openings[v]}

${photoStripHTML(photos, name)}

${processIntros[v]}
<ol>
  <li><strong>Emergency Assessment:</strong> Thermal imaging cameras and calibrated moisture meters map all affected areas including hidden moisture behind walls and under floors — we never guess at scope.</li>
  <li><strong>Water Extraction:</strong> Truck-mount extractors remove standing water fast — far more powerful than anything available at rental stores. We begin drying within minutes of arrival.</li>
  <li><strong>Structural Drying:</strong> High-velocity air movers create the evaporation rate required to dry structural materials to IICRC standards. Equipment placement is calculated, not random.</li>
  <li><strong>Commercial Dehumidification:</strong> Phoenix LGR dehumidifiers pull moisture out of the air continuously, maintaining humidity conditions that accelerate drying and prevent secondary mold growth.</li>
  <li><strong>Daily Moisture Monitoring:</strong> We return every day, take readings at every monitoring point, and log everything. Your adjuster receives complete documentation of the drying process.</li>
  <li><strong>Full Reconstruction:</strong> Michigan Builder's License — drywall, flooring, cabinetry, painting — all under the same contract. You deal with one company from first response to final walkthrough.</li>
</ol>

${causeIntros[v]}
<ul>
  <li><strong>Burst pipes</strong> during Michigan winters — most common when temps drop below 20°F in unheated spaces</li>
  <li><strong>Basement flooding</strong> from spring snowmelt or heavy rain overwhelming ${county} County drainage systems</li>
  <li><strong>Sump pump failure</strong> during power outages or when pump capacity is exceeded by storm volume</li>
  <li><strong>Appliance failures</strong> — washing machine supply lines, water heaters, dishwashers, refrigerator ice makers</li>
  <li><strong>Roof leaks</strong> from ice dams, wind damage, or deteriorating flashing — water travels far inside walls before becoming visible</li>
  <li><strong>Sewage backup</strong> — Category 3 black water requiring full biohazard protocol, not standard drying</li>
</ul>

<h2>Direct Insurance Billing — ${county} County Claims</h2>
<p>We bill State Farm, Allstate, Farmers, Liberty Mutual, USAA, Nationwide, Travelers, Auto-Owners, and all major carriers directly. We prepare complete Xactimate documentation and coordinate with your adjuster through the entire claim. ${name} homeowners pay only their deductible — we handle the rest.</p>

<div style="background:var(--bg-light);border-left:4px solid var(--accent);padding:1.25rem 1.5rem;border-radius:0 var(--radius-md) var(--radius-md) 0;margin:2rem 0;">
  <p style="margin:0;font-weight:600;">${quotes[v]}</p>
  <p style="margin:.5rem 0 0;font-size:.85rem;color:var(--text-muted);">— West Michigan homeowner · ★★★★★ Google Review</p>
</div>

${c.slug === 'grand-rapids-mi' ? grandRapidsBoost('water-damage-restoration') : ''}
<h2>Water Damage Questions — ${name}, MI</h2>
<div style="display:flex;flex-direction:column;gap:.75rem;margin-top:1rem;">
${faqs[v].join('\n')}
</div>`;
}

function fireBody(c, v) {
  const {name, county, minutes} = c;

  const openings = [
    `<p class="lead">Fire and smoke damage in ${name} requires immediate professional response. Soot and smoke residue begin permanently bonding to surfaces within hours — and spread through HVAC systems faster than most homeowners expect. Our IICRC-certified team dispatches from Walker, MI and arrives in approximately ${minutes} minutes, ready to contain the damage and begin systematic restoration.</p><p>We serve all of ${county} County 24/7. Family-owned since 1981. Michigan Builder's License covers full reconstruction under one contract.</p>`,
    `<p class="lead">After a fire in your ${name} home, the visible char is only part of the damage. Smoke infiltrates wall cavities, ductwork, and porous building materials — leaving behind corrosive compounds and persistent odor that requires professional neutralization, not masking. Our crew arrives in approximately ${minutes} minutes from Walker, MI equipped for complete fire and smoke restoration.</p><p>${county} County homeowners have relied on this family business for over 40 years. The same team handles every job from emergency board-up through final reconstruction.</p>`,
    `<p class="lead">Every fire damage situation in ${name} is different — a kitchen grease fire creates protein-based deposits that demand specialized chemistry; an electrical fire requires structural assessment before any work begins; a bedroom fire may need full contents cleaning and storage while the structure is rebuilt. Our IICRC-certified team assesses, documents, and restores — completely, not partially.</p><p>We dispatch from Walker, MI — approximately ${minutes} minutes from ${name}. Available every hour of every day.</p>`,
    `<p class="lead">The 48 hours after a fire in your ${name} home are critical. Soot becomes increasingly difficult to remove as it bonds to surfaces. Metal fixtures begin to corrode. Smoke odor penetrates deeper into drywall and insulation. Fast, professional response is the difference between cleaning and replacement. Our team dispatches in approximately ${minutes} minutes from Walker, MI and works systematically through every affected area.</p><p>IICRC certified. Michigan Builder's License. Direct insurance billing. No handoffs — same crew, start to finish.</p>`,
  ];

  const faqs = [
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Is it safe to stay in my ${name} home after a fire?</summary><p style="margin-top:.75rem;">Often no — even small fires leave carbon monoxide residue, corrosive soot particulates, and potential structural hazards. Do not reoccupy until a professional assessment confirms safety. We provide that on arrival.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Can smoke odor be completely eliminated?</summary><p style="margin-top:.75rem;">Yes — with professional thermal fogging and hydroxyl generator treatment that neutralizes odor molecules throughout the structure, including inside wall cavities and HVAC systems. Consumer products mask odor temporarily. Professional treatment eliminates it permanently.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">How long does fire damage restoration take?</summary><p style="margin-top:.75rem;">Emergency cleanup, smoke mitigation, and deodorization typically take 1–2 weeks. Full reconstruction depends on scope — we provide a detailed written estimate after assessment. We move as fast as material availability and permit timelines allow.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What should I do immediately after a fire in ${name}?</summary><p style="margin-top:.75rem;">Call (616) 822-1978 or text us first. Do not enter until fire department clears the structure. Do not run HVAC — it spreads soot. Do not attempt to clean soot yourself. We provide immediate guidance on the call and dispatch within minutes.</p></details>`,
    ],
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Will my homeowner's insurance cover fire damage in ${name}?</summary><p style="margin-top:.75rem;">Fire damage is covered under virtually all standard homeowner's policies — including the structure, smoke damage, personal property, and often additional living expenses if you must temporarily relocate. We document everything your adjuster needs and bill carriers directly.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Can you save my belongings after fire damage?</summary><p style="margin-top:.75rem;">Many items can be cleaned and restored using ultrasonic cleaning, ozone treatment, and specialized content cleaning. We assess all contents, create a documented inventory for your insurance claim, and restore whatever is salvageable.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Do you handle board-up and emergency securing?</summary><p style="margin-top:.75rem;">Yes — emergency board-up and roof tarping are typically the first tasks on arrival. We secure the structure against weather and unauthorized entry before beginning any cleanup or assessment.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Does your company handle full reconstruction after fire?</summary><p style="margin-top:.75rem;">Yes — our Michigan Builder's License covers everything from structural framing through drywall, flooring, cabinetry, and painting. One company, one contract. No coordinating between separate restoration and construction contractors.</p></details>`,
    ],
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Why is professional soot removal necessary?</summary><p style="margin-top:.75rem;">Different types of soot require different cleaning chemistry. Protein-based soot from kitchen fires needs enzymatic cleaners. Wet soot needs dry-cleaning methods first. Applying the wrong method spreads and permanently sets the residue. Professional technicians identify soot type and apply the correct protocol.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">How fast can you respond to fire damage in ${name}?</summary><p style="margin-top:.75rem;">We dispatch immediately from Walker, MI — approximately ${minutes} minutes from ${name}. Available 24/7, every day of the year. No answering service, no call queue.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What about duct cleaning after a fire?</summary><p style="margin-top:.75rem;">If the HVAC system was running during or after the fire, soot has circulated through ductwork. Duct cleaning is typically a required line item in fire damage claims. We assess and include this in the full scope of work.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What causes most house fires in ${county} County?</summary><p style="margin-top:.75rem;">In West Michigan, the most common causes are kitchen fires (cooking equipment), heating equipment (furnaces, fireplaces, space heaters), electrical faults, and candles. Smoke detectors on every level and a working fire extinguisher in the kitchen are the most effective preventive measures.</p></details>`,
    ],
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Do you serve ${name} for fire damage 24/7?</summary><p style="margin-top:.75rem;">Yes — 24 hours a day, 365 days a year. No premium charge for nights or weekends. Fire damage response requires immediate action and we are available at any hour.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What is thermal fogging?</summary><p style="margin-top:.75rem;">Thermal fogging uses heat to vaporize a deodorizing chemical into particles small enough to penetrate everywhere smoke traveled — including inside walls and through HVAC systems. It is the most effective method for eliminating smoke odor from a structure.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">How do I choose between restoration and replacement after fire?</summary><p style="margin-top:.75rem;">We provide an honest assessment of what can be restored vs. what must be replaced — based on actual damage, not what maximizes our invoice. Materials that are structurally compromised, have irreversible odor absorption, or are not cost-effective to restore are documented for replacement in the insurance claim.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Are your fire damage estimates free?</summary><p style="margin-top:.75rem;">Yes. We provide a complete written estimate at no charge. If you're filing an insurance claim, our estimate is in Xactimate format — the industry-standard software used by insurance adjusters — which means fewer disputes and faster approvals.</p></details>`,
    ],
  ];

  const quotes = [
    `"Disaster Response did an excellent job after the fire in our living room. Made an awful situation manageable. Honest, fair pricing."`,
    `"Ryan and his team showed up fast, explained everything clearly, and got to work immediately. Cleaned up all the smoke damage and got rid of the odor."`,
    `"They were professional, thorough, and got our home back to better than before. Insurance handled smoothly."`,
    `"Couldn't recommend highly enough. Every step was explained, timeline was met, and they treated our home with respect."`,
  ];

  const photos = getPhotos('fire-damage-restoration', v * 7, 2);



  const extra = CITIES_DATA.find(x => x.id === c.slug) || { hook: 'Local topography significantly impacts property moisture. Contact Disaster Response for hyper-local assessment.', risk: 'Pipe bursts, drainage issues, appliance failures.' };
  const geoHTML = `
<div class="neo-card" style="margin:3.5rem 0; padding:3rem; background: rgba(255, 255, 255, 0.05); border-left:5px solid var(--accent); box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border-radius:12px;">
  <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
    <div style="background:var(--bg-light); padding:1rem; border-radius:50%; color:var(--accent);">
      <i class="fa-solid fa-map-location-dot fa-2x"></i>
    </div>
    <h2 style="color: #fff; margin:0; font-size:1.8rem;">Local Geography & Property Risks in ${name}, MI</h2>
  </div>
  <p class="lead" style="font-size:1.15rem; line-height:1.7; color:var(--text-main);">${extra.hook}</p>
  
  <div style="margin-top:2rem; background:var(--bg-light); border:1px solid var(--border); padding:2rem; border-radius:8px;">
    <h3 style="margin-top:0; margin-bottom:1rem; font-size:1.3rem; color: #fff; border-bottom:2px solid var(--border); padding-bottom:0.5rem;">Specific ${county} County Constraints</h3>
    <p style="font-weight:600; font-size:1.1rem; color:#334155; margin:0; line-height:1.6;"><i class="fa-solid fa-triangle-exclamation" style="color:var(--accent); margin-right:0.5rem;"></i> ${extra.risk}</p>
  </div>
  
  <p style="margin-top:2rem; font-size:1.05rem; color:#475569; line-height:1.8; padding-top:1.5rem; border-top:1px solid var(--border);">Our Walker, MI headquarters is approximately ${minutes} minutes from ${name}. This precise proximity is critical. It allows our IICRC-certified emergency team to navigate ${county} County direct routes to reach your property before the 24-hour microbial threshold is crossed. Because we understand the exact environmental pressures of ${name} — whether dealing with clay soil hydrostatic pressure, local watershed flooding, or architectural age factors — our mitigation strategy prevents unnecessary demolition and drastically reduces your restoration costs. We do not use the same boilerplate drying approach for a Heritage Hill historic home that we would for a 1990s build in ${name}; our science is customized to your geography.</p>
</div>`;

  return `
${geoHTML}
<h2>${['Fire & Smoke Damage Response for','Professional Fire Restoration in','Complete Fire & Smoke Cleanup in','IICRC-Certified Fire Damage Service for'][v]} ${name}, MI</h2>
${openings[v]}

${photoStripHTML(photos, name)}

<h2>Our Fire & Smoke Restoration Process</h2>
<ol>
  <li><strong>Emergency Board-Up & Tarping:</strong> We secure your ${name} property immediately — boarding openings and tarping the roof to prevent weather intrusion and unauthorized access.</li>
  <li><strong>Full Damage Assessment:</strong> Complete photo and written documentation of all fire, smoke, and soot damage for your insurance claim. Xactimate estimate prepared for your adjuster.</li>
  <li><strong>Dry Soot Removal First:</strong> Dry sponge cleaning of walls, ceilings, and surfaces before any wet cleaning — prevents soot from being ground into materials permanently.</li>
  <li><strong>Odor Neutralization:</strong> Thermal fogging and hydroxyl generator treatment penetrate areas surface cleaning cannot reach — wall cavities, ductwork, subfloor, attic.</li>
  <li><strong>Content Cleaning & Inventory:</strong> Salvageable belongings are documented, cleaned, and restored using professional ultrasonic and ozone methods. Full inventory for your insurance claim.</li>
  <li><strong>Full Reconstruction:</strong> Michigan Builder's License — framing, drywall, flooring, cabinetry, painting — one company, no handoffs, complete rebuild under a single contract.</li>
</ol>

<h2>Types of Fire Damage We Handle in ${name}, MI</h2>
<ul>
  <li><strong>Kitchen fires:</strong> Grease fires produce heavy protein-based soot and odor requiring specialized enzymatic cleaning — not general household cleaners</li>
  <li><strong>Electrical fires:</strong> Often originate inside walls — require careful structural assessment and electrical system evaluation before reconstruction</li>
  <li><strong>Heating equipment fires:</strong> Furnace, fireplace, and space heater fires frequently spread through ductwork and require duct cleaning as part of restoration</li>
  <li><strong>Smoke intrusion:</strong> Even without direct structural fire damage, heavy smoke infiltration from neighboring fires requires professional deodorization</li>
</ul>

<h2>Direct Insurance Billing for ${name} Fire Claims</h2>
<p>Fire damage is covered under virtually all standard homeowner's policies. We prepare complete Xactimate documentation and coordinate directly with State Farm, Allstate, Farmers, Liberty Mutual, USAA, Nationwide, Travelers, Auto-Owners, and all major carriers. ${county} County homeowners pay only their deductible.</p>

<div style="background:var(--bg-light);border-left:4px solid var(--accent);padding:1.25rem 1.5rem;border-radius:0 var(--radius-md) var(--radius-md) 0;margin:2rem 0;">
  <p style="margin:0;font-weight:600;">${quotes[v]}</p>
  <p style="margin:.5rem 0 0;font-size:.85rem;color:var(--text-muted);">— West Michigan homeowner · ★★★★★ Google Review</p>
</div>

${c.slug === 'grand-rapids-mi' ? grandRapidsBoost('fire-damage-restoration') : ''}
<h2>Fire & Smoke Damage Questions — ${name}, MI</h2>
<div style="display:flex;flex-direction:column;gap:.75rem;margin-top:1rem;">
${faqs[v].join('\n')}
</div>`;
}

function moldBody(c, v) {
  const {name, county, minutes} = c;

  const openings = [
    `<p class="lead">Mold in a ${name} home doesn't go away on its own — it spreads to unaffected areas, degrades building materials, and creates ongoing air quality problems. Our IICRC-certified team follows EPA and IICRC S520 protocols: containment, removal, air testing, and clearance. Approximately ${minutes} minutes from ${name}. Available every day.</p><p>Family-owned since 1981. Michigan Builder's License for full structural reconstruction after remediation. Same crew from assessment to clearance.</p>`,
    `<p class="lead">Michigan's climate makes mold a real risk for ${county} County homeowners — humid summers, snowmelt-saturated soil, and older homes with less-than-perfect moisture barriers create conditions where mold establishes quickly. Our IICRC-certified team identifies the moisture source, removes the mold safely, and eliminates the conditions that allowed it to grow. We're approximately ${minutes} minutes from ${name}.</p><p>We don't just treat visible mold — we find the moisture source, or the mold will return regardless of how thoroughly the surface is cleaned.</p>`,
    `<p class="lead">Mold behind drywall. Mold under flooring. Mold in a crawlspace that's been damp for years. Every mold problem in ${name} has a moisture source — and every remediation we complete addresses both the mold and the source. IICRC S520 certified process. Third-party post-remediation air testing for documented clearance. Michigan Builder's License to rebuild after removal.</p><p>Approximately ${minutes} minutes from ${name}. ${county} County families trust this family business with their homes.</p>`,
    `<p class="lead">That musty smell in your ${name} basement isn't just unpleasant — it's an indicator of active mold growth. Left unaddressed, mold spreads through wall cavities and HVAC systems, affects indoor air quality, and causes progressive structural damage. Our IICRC-certified team provides complete mold remediation: assessment, containment, removal, treatment, and verified air quality clearance.</p><p>Dispatching from Walker, MI — approximately ${minutes} minutes from ${name}. Same crew from first inspection to final clearance.</p>`,
  ];

  const photos = getPhotos('mold-remediation', v * 11, 2);
  const quotes = [
    `"Super knowledgeable and easy to work with. Found mold behind the drywall, walked us through everything, removed it safely."`,
    `"Thorough, professional, and transparent about every step. Air test confirmed clear before they closed the walls."`,
    `"They found the moisture source that three other companies missed. Fixed the problem at the root, not just the surface."`,
    `"Excellent work. Explained the process clearly, worked cleanly, and the post-remediation test came back clean."`,
  ];

  const faqs = [
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">How do I know if I have mold in my ${name} home?</summary><p style="margin-top:.75rem;">Common indicators: musty odor (especially in basement or crawlspace), visible black, green, or white discoloration on walls or ceilings, unexplained allergy or respiratory symptoms, or recent water damage that wasn't professionally dried. When in doubt, have it inspected.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Is DIY mold removal safe in ${name}?</summary><p style="margin-top:.75rem;">For very small surface areas (under 10 sq ft) with no hidden growth and no health concerns, limited DIY treatment is sometimes appropriate. For anything larger, anything behind walls, or any situation involving compromised immune systems, professional remediation is essential. Improper removal spreads spores through the air and worsens the problem.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">How long does mold remediation take?</summary><p style="margin-top:.75rem;">Typical remediation takes 2–5 days. Containment setup, remediation, antimicrobial treatment, and HEPA vacuuming are sequential. Post-remediation air testing takes an additional 24–48 hours for lab results. We do not skip the clearance test.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Will mold come back after remediation?</summary><p style="margin-top:.75rem;">Only if the moisture source is not corrected. We identify and address the moisture source on every job — not just remove the visible mold. Without fixing what allowed mold to grow, it will return.</p></details>`,
    ],
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Does homeowner's insurance cover mold in ${name}?</summary><p style="margin-top:.75rem;">Coverage for mold remediation is complex and situational. Most standard policies only cover mold if it resulted from a "sudden and accidental" covered water loss. Even then, coverage is not guaranteed and often has low sub-limits. We provide the expert documentation required for a claim, but we always advise clients to verify their specific policy limits first.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What is post-remediation clearance testing?</summary><p style="margin-top:.75rem;">Air samples taken after remediation are sent to an independent lab to verify spore counts are within normal outdoor baseline levels. This is the documented proof that remediation was successful. We require clearance testing on every job — it protects you and us.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What causes mold in ${county} County basements?</summary><p style="margin-top:.75rem;">Michigan's clay-heavy soils, high water table in many areas, and freeze-thaw cycles create persistent basement moisture pressure. Inadequate exterior waterproofing, cracks in foundation walls, and poor grading that directs water toward the foundation are the most common culprits.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Is black mold more dangerous than other mold?</summary><p style="margin-top:.75rem;">All mold should be remediated professionally, regardless of color. "Black mold" (Stachybotrys) is one of many species that appears dark-colored — and many dangerous molds are not black. Species identification via air testing is part of our assessment.</p></details>`,
    ],
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Can mold affect my ${name} home's value?</summary><p style="margin-top:.75rem;">Undisclosed mold is a material defect in Michigan real estate transactions. Professionally remediated and documented mold — with clearance test results on file — does not permanently impact property value and is properly disclosed. We provide complete documentation for your records.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Do you rebuild after mold remediation?</summary><p style="margin-top:.75rem;">Yes — our Michigan Builder's License covers full reconstruction after remediation: drywall, insulation, flooring, and cabinetry. One company handles everything from mold removal through finished reconstruction. No separate contractor needed.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">How do you contain mold during remediation?</summary><p style="margin-top:.75rem;">We set up poly containment barriers with zipper entries and run HEPA-filtered negative air pressure machines continuously during remediation. This creates a contained workspace where disturbed spores are captured before they can spread to unaffected areas of your ${name} home.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">How quickly can mold grow after water damage?</summary><p style="margin-top:.75rem;">Mold can begin colonizing within 24–48 hours of water intrusion in the right conditions — warm temperatures, adequate moisture, and organic material (drywall, wood, insulation). This is why immediate professional water damage drying is the best mold prevention.</p></details>`,
    ],
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Do you serve ${name} for mold inspection?</summary><p style="margin-top:.75rem;">Yes — we serve all of ${county} County including ${name}. We dispatch from Walker, MI — approximately ${minutes} minutes away — and are available every day.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What IICRC standard governs mold remediation?</summary><p style="margin-top:.75rem;">IICRC S520 — Standard and Reference Guide for Professional Mold Remediation. This standard defines containment requirements, worker protection, removal protocols, and post-remediation verification. Our team is certified and trained to this standard.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Can mold in the attic affect the rest of my ${name} home?</summary><p style="margin-top:.75rem;">Yes — attic mold from inadequate ventilation or roof leaks can spread spores through penetrations in the ceiling. Musty smell throughout the house with no obvious basement source is a common sign of attic mold. We assess attic, basement, and crawlspace on every inspection.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What does professional mold remediation cost?</summary><p style="margin-top:.75rem;">Cost varies by affected area size, accessibility, and scope of structural removal needed. Small contained areas may be a few hundred dollars. Larger projects involving significant drywall removal and reconstruction can be several thousand. We provide free written estimates and handle insurance billing where coverage applies.</p></details>`,
    ],
  ];



  const extra = CITIES_DATA.find(x => x.id === c.slug) || { hook: 'Local topography significantly impacts property moisture. Contact Disaster Response for hyper-local assessment.', risk: 'Pipe bursts, drainage issues, appliance failures.' };
  const geoHTML = `
<div class="neo-card" style="margin:3.5rem 0; padding:3rem; background: rgba(255, 255, 255, 0.05); border-left:5px solid var(--accent); box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border-radius:12px;">
  <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
    <div style="background:var(--bg-light); padding:1rem; border-radius:50%; color:var(--accent);">
      <i class="fa-solid fa-map-location-dot fa-2x"></i>
    </div>
    <h2 style="color: #fff; margin:0; font-size:1.8rem;">Local Geography & Property Risks in ${name}, MI</h2>
  </div>
  <p class="lead" style="font-size:1.15rem; line-height:1.7; color:var(--text-main);">${extra.hook}</p>
  
  <div style="margin-top:2rem; background:var(--bg-light); border:1px solid var(--border); padding:2rem; border-radius:8px;">
    <h3 style="margin-top:0; margin-bottom:1rem; font-size:1.3rem; color: #fff; border-bottom:2px solid var(--border); padding-bottom:0.5rem;">Specific ${county} County Constraints</h3>
    <p style="font-weight:600; font-size:1.1rem; color:#334155; margin:0; line-height:1.6;"><i class="fa-solid fa-triangle-exclamation" style="color:var(--accent); margin-right:0.5rem;"></i> ${extra.risk}</p>
  </div>
  
  <p style="margin-top:2rem; font-size:1.05rem; color:#475569; line-height:1.8; padding-top:1.5rem; border-top:1px solid var(--border);">Our Walker, MI headquarters is approximately ${minutes} minutes from ${name}. This precise proximity is critical. It allows our IICRC-certified emergency team to navigate ${county} County direct routes to reach your property before the 24-hour microbial threshold is crossed. Because we understand the exact environmental pressures of ${name} — whether dealing with clay soil hydrostatic pressure, local watershed flooding, or architectural age factors — our mitigation strategy prevents unnecessary demolition and drastically reduces your restoration costs. We do not use the same boilerplate drying approach for a Heritage Hill historic home that we would for a 1990s build in ${name}; our science is customized to your geography.</p>
</div>`;

  return `
${geoHTML}
<h2>${['Professional Mold Remediation in','IICRC-Certified Mold Removal for','Complete Mold Remediation Serving','Safe Mold Removal for'][v]} ${name}, MI</h2>
${openings[v]}

<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:2rem; margin:2.5rem 0;">
  <div style="display:flex; gap:1.5rem; align-items:start;">
    <div style="background: rgba(255, 255, 255, 0.05); padding:1rem; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
      <i class="fa-solid fa-leaf" style="color:#15803d; font-size:1.75rem;"></i>
    </div>
    <div>
      <h3 style="margin:0 0 0.5rem; color:#14532d; font-size:1.2rem;">Holistic & Hypersensitive Mold Remediation</h3>
      <p style="margin:0; font-size:0.95rem; line-height:1.6; color:#14532d;">
        For our hypersensitive clients in ${name}, we partner with <strong>Lisa</strong> at <a href="https://www.wellabode.com/about" target="_blank" rel="noopener" style="color:#14532d; font-weight:700; text-decoration:underline;">Well Abode</a>.
        Lisa is a Building Biologist who specializes in creating safe environments for those with CIRS (Chronic Inflammatory Response Syndrome) and mold sensitivities.
        <strong>Lisa leads the protocol writing</strong> for these cases, which our team executes with surgical precision to ensure your home is truly safe.
      </p>
    </div>
  </div>
</div>

${photoStripHTML(photos, name)}

<h2>Our IICRC S520 Mold Remediation Process</h2>
<ol>
  <li><strong>Inspection & Moisture Mapping:</strong> Thermal imaging and moisture meters locate all active moisture — including hidden sources behind walls and under floors that are feeding the mold growth.</li>
  <li><strong>Air Quality Sampling:</strong> Baseline spore trap samples identify mold species present and establish pre-remediation levels for comparison with post-clearance results.</li>
  <li><strong>Containment Setup:</strong> Poly barriers with zipper entries and HEPA-filtered negative air pressure machines isolate the work area. Spores disturbed during removal cannot travel to unaffected areas of your ${name} home.</li>
  <li><strong>Mold Removal:</strong> All porous materials with mold growth — drywall, insulation, wood framing where indicated — are removed, double-bagged in poly, and disposed of per Michigan regulations.</li>
  <li><strong>Antimicrobial Treatment:</strong> Structural surfaces are treated with EPA-registered antimicrobials. Remaining wood framing is encapsulated where required.</li>
  <li><strong>Post-Remediation Air Testing:</strong> Independent lab air samples confirm spore counts are within normal outdoor baseline levels. Work is not complete until clearance is confirmed.</li>
  <li><strong>Full Reconstruction:</strong> Michigan Builder's License — we install new drywall, insulation, flooring, and cabinetry to pre-loss condition. One company, complete project.</li>
</ol>

<h2>Where Mold Hides in ${name}, MI Homes</h2>
<ul>
  <li><strong>Basements:</strong> ${county} County's soil conditions and water table make basement moisture intrusion a persistent problem — mold grows on drywall, framing, and stored materials</li>
  <li><strong>Crawlspaces:</strong> Inadequate vapor barrier allows ground moisture to condense on floor joists — often undiscovered for years</li>
  <li><strong>Bathroom walls:</strong> Slow supply line leaks or poor ventilation behind tile — tile and grout appear fine while mold grows on the drywall behind</li>
  <li><strong>Attics:</strong> Improper ventilation causes condensation on roof sheathing, especially in Michigan winters when warm attic air meets cold roof deck</li>
  <li><strong>After any water event:</strong> Any water damage not professionally dried to confirmed moisture readings can produce mold within 24–48 hours</li>
</ul>

<h2>Insurance Coverage for Mold in ${county} County</h2>
<p>Insurance coverage for mold remediation is highly situational and depends on your specific policy language. Generally, mold is only considered for coverage if it resulted from a "sudden and accidental" water loss that is itself a covered peril. Even then, many policies have strict sub-limits or exclusions for mold. We provide the professional documentation required to submit a claim, but we always recommend verifying coverage details directly with your agent.</p>

<div style="background:var(--bg-light);border-left:4px solid var(--accent);padding:1.25rem 1.5rem;border-radius:0 var(--radius-md) var(--radius-md) 0;margin:2rem 0;">
  <p style="margin:0;font-weight:600;">${quotes[v]}</p>
  <p style="margin:.5rem 0 0;font-size:.85rem;color:var(--text-muted);">— West Michigan homeowner · ★★★★★ Google Review</p>
</div>

${c.slug === 'grand-rapids-mi' ? grandRapidsBoost('mold-remediation') : ''}
<h2>Mold Questions — ${name}, MI</h2>
<div style="display:flex;flex-direction:column;gap:.75rem;margin-top:1rem;">
${faqs[v].join('\n')}
</div>`;
}

function sewageBody(c, v) {
  const {name, county, minutes} = c;

  const openings = [
    `<p class="lead">Sewage backup is a Category 3 biohazard — the most serious classification of water damage. Raw sewage contains bacteria, viruses, and parasites that are immediately dangerous. Do not attempt cleanup yourself. Our IICRC-certified team dispatches from Walker, MI, arrives in approximately ${minutes} minutes, and contains the hazard immediately using proper PPE and biohazard protocol.</p><p>${county} County families trust this family business for the most difficult, unpleasant, and urgent situations. We handle it completely, from extraction through reconstruction.</p>`,
    `<p class="lead">A sewage backup in your ${name} home is not a plumbing problem — it's a public health emergency. Category 3 black water requires professional extraction, hospital-grade sanitization, demolition of all affected porous materials, and documented air quality clearance. Our IICRC-certified team is available 24/7 and dispatches in approximately ${minutes} minutes from Walker, MI.</p><p>IICRC certified. Michigan Builder's License. Same crew from emergency extraction through final reconstruction. No handoffs.</p>`,
    `<p class="lead">Michigan's aging sewer infrastructure and spring storm surges make sewage backup a real risk for ${county} County homeowners — particularly in neighborhoods with older sewer laterals or low-lying floor drains. When it happens, the response window is narrow. Our team reaches ${name} in approximately ${minutes} minutes and gets to work immediately on containment, extraction, and sanitization.</p><p>Every sewage backup we handle is documented completely for insurance — Xactimate estimates, photo evidence, moisture logs, and air quality clearance.</p>`,
    `<p class="lead">Floor drains backing up. Sewage visible in the basement. These are the moments that demand immediate professional response — not a call to a plumber, not a rental shop wet-vac. Category 3 biohazard cleanup requires licensed professionals with the right equipment, the right chemistry, and the right disposal protocols. Our team reaches ${name} in approximately ${minutes} minutes. Available every hour of every day.</p><p>Family-owned since 1981. No franchise. No corporate overhead. The same people who extract the sewage rebuild your space afterward.</p>`,
  ];

  const photos = getPhotos('sewage-cleanup', v * 9, 2);
  const quotes = [
    `"The whole team at Disaster Response is top notch. When we had a need, they were prompt and professional to take care of everything."`,
    `"Showed up fast, handled everything professionally, and treated the whole situation with urgency and respect."`,
    `"Nobody wants to deal with sewage backup — but if you have to, this is the team you want. Complete, professional, and fast."`,
    `"Handled a very unpleasant situation completely and professionally. Documented everything for insurance perfectly."`,
  ];

  const faqs = [
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Is sewage backup dangerous?</summary><p style="margin-top:.75rem;">Yes — Category 3 sewage water contains E. coli, hepatitis A, salmonella, and other pathogens. Skin contact and inhaling aerosols are genuine health risks. Do not enter affected areas without full PPE. Call or text us immediately at (616) 822-1978.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Can I clean up sewage backup myself?</summary><p style="margin-top:.75rem;">No. Category 3 biohazard cleanup requires proper PPE, licensed hazardous materials disposal, EPA-registered disinfectants specific to sewage pathogens, and professional air quality testing to confirm the space is safe. DIY cleanup leaves residual contamination and creates ongoing health risks.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">How fast can you respond to sewage backup in ${name}?</summary><p style="margin-top:.75rem;">We dispatch immediately — approximately ${minutes} minutes from ${name}. Available 24 hours a day, every day including holidays. Call or text (616) 822-1978 now.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Does homeowner's insurance cover sewage backup?</summary><p style="margin-top:.75rem;">Standard dwelling coverage typically excludes sewage backup. Many policies include it as a "water backup" or "sewer backup" endorsement. Check your declarations page for this endorsement. We help you understand your coverage on the first call.</p></details>`,
    ],
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What causes sewage backup in ${county} County?</summary><p style="margin-top:.75rem;">Most common causes: municipal sewer surcharge during heavy rain (city sewer line capacity exceeded, sewage pushes back through floor drains), tree root intrusion in sewer laterals, clogged laterals from grease or non-flushable wipes, failed sump pumps, and deteriorating old clay or cast iron pipe.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Do all affected materials need to be removed?</summary><p style="margin-top:.75rem;">All porous materials that contacted Category 3 sewage — drywall, insulation, carpet, padding, wood flooring — must be removed and disposed of. These materials cannot be safely cleaned and sanitized. Structural materials that can be fully disinfected (concrete, certain metals) can sometimes be salvaged.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What should I do immediately after sewage backup in ${name}?</summary><p style="margin-top:.75rem;">Call (616) 822-1978 or text immediately. Do not enter the affected area without rubber boots and gloves. Turn off HVAC to prevent aerosolization. Keep children and pets away from the area. We provide immediate guidance on the call and dispatch within minutes.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Do you rebuild after sewage cleanup?</summary><p style="margin-top:.75rem;">Yes — our Michigan Builder's License covers complete reconstruction after biohazard remediation. New drywall, insulation, flooring, and cabinetry under the same contract. You work with the same team through the entire project.</p></details>`,
    ],
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">How long does sewage cleanup take?</summary><p style="margin-top:.75rem;">Emergency extraction and containment begin immediately on arrival. Demolition of contaminated materials, sanitization, and deodorization typically complete within 1–2 days. Reconstruction timeline depends on scope. We provide a complete written estimate after assessment.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Is sewage backup covered if it came from city lines?</summary><p style="margin-top:.75rem;">The city is not typically liable for sewer backup into private property unless negligence can be proven. Your homeowner's policy water backup endorsement is usually the applicable coverage. Some municipalities offer optional sewer backup coverage — check with ${name} city services.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">How do you prevent future sewage backup in ${name}?</summary><p style="margin-top:.75rem;">We recommend having your sewer lateral scoped by a plumber after any backup event to identify root intrusion or pipe damage. Installing a backwater valve on your floor drain prevents municipal sewer surcharge from entering your home. Battery-backup sump pumps prevent failures during power outages.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What disinfectants do you use for sewage cleanup?</summary><p style="margin-top:.75rem;">We use EPA-registered, hospital-grade disinfectants that are specifically effective against the pathogens present in sewage — including E. coli, hepatitis, and salmonella. Not bleach-and-bucket. Professional-grade application ensures complete surface sanitization.</p></details>`,
    ],
    [
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Do you serve ${name} for sewage cleanup 24/7?</summary><p style="margin-top:.75rem;">Yes — 24 hours a day, 365 days a year. Sewage backup emergencies happen at the worst times. There is no premium charge for nights, weekends, or holidays.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">What documentation do you provide for insurance claims?</summary><p style="margin-top:.75rem;">Complete photo documentation of all affected areas before, during, and after remediation. Moisture readings. Scope of work. Xactimate estimate. Disposal manifests for biohazard materials. Everything your adjuster needs in the format they use.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Is mold a risk after sewage backup?</summary><p style="margin-top:.75rem;">Yes — any moisture event creates mold risk within 24–48 hours, and Category 3 sewage provides both moisture and organic matter that accelerates mold growth. We assess for and address mold risk as part of every sewage cleanup — including treatment of structural surfaces with antimicrobial agents after sanitization.</p></details>`,
      `<details style="border:1px solid var(--bg-subtle);border-radius:var(--radius-md);padding:1rem 1.25rem;"><summary style="font-weight:700;cursor:pointer;">Can I flush toilets during sewage backup?</summary><p style="margin-top:.75rem;">Do not use any plumbing fixtures — toilets, sinks, showers — until the backup is resolved. Using fixtures while the system is backed up will introduce more sewage into the affected area. Your plumber should scope and clear the blockage before water service is fully restored.</p></details>`,
    ],
  ];

  const extra = CITIES_DATA.find(x => x.id === c.slug) || { hook: 'Local topography significantly impacts property moisture. Contact Disaster Response for hyper-local assessment.', risk: 'Pipe bursts, drainage issues, appliance failures.' };
  const geoHTML = `
<div class="neo-card" style="margin:3.5rem 0; padding:3rem; background: rgba(255, 255, 255, 0.05); border-left:5px solid var(--accent); box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border-radius:12px;">
  <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
    <div style="background:var(--bg-light); padding:1rem; border-radius:50%; color:var(--accent);">
      <i class="fa-solid fa-map-location-dot fa-2x"></i>
    </div>
    <h2 style="color: #fff; margin:0; font-size:1.8rem;">Local Geography & Property Risks in ${name}, MI</h2>
  </div>
  <p class="lead" style="font-size:1.15rem; line-height:1.7; color:var(--text-main);">${extra.hook}</p>
  
  <div style="margin-top:2rem; background:var(--bg-light); border:1px solid var(--border); padding:2rem; border-radius:8px;">
    <h3 style="margin-top:0; margin-bottom:1rem; font-size:1.3rem; color: #fff; border-bottom:2px solid var(--border); padding-bottom:0.5rem;">Specific ${county} County Constraints</h3>
    <p style="font-weight:600; font-size:1.1rem; color:#334155; margin:0; line-height:1.6;"><i class="fa-solid fa-triangle-exclamation" style="color:var(--accent); margin-right:0.5rem;"></i> ${extra.risk}</p>
  </div>
  
  <p style="margin-top:2rem; font-size:1.05rem; color:#475569; line-height:1.8; padding-top:1.5rem; border-top:1px solid var(--border);">Our Walker, MI headquarters is approximately ${minutes} minutes from ${name}. This precise proximity is critical. It allows our IICRC-certified emergency team to navigate ${county} County direct routes to reach your property before the 24-hour microbial threshold is crossed. Because we understand the exact environmental pressures of ${name} — whether dealing with clay soil hydrostatic pressure, local watershed flooding, or architectural age factors — our mitigation strategy prevents unnecessary demolition and drastically reduces your restoration costs. We do not use the same boilerplate drying approach for a Heritage Hill historic home that we would for a 1990s build in ${name}; our science is customized to your geography.</p>
</div>`;

  return `
${geoHTML}
<h2>${['24/7 Sewage Backup Response for','Professional Sewage Cleanup in','Emergency Sewage Cleanup Serving','IICRC-Certified Sewage Cleanup for'][v]} ${name}, MI</h2>

<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:1.25rem 1.5rem;border-radius:0 var(--radius-md) var(--radius-md) 0;margin-bottom:1.5rem;">
  <p style="margin:0;font-weight:700;color:#991b1b;">⚠️ Sewage backup is a Category 3 biohazard. Do not enter without PPE. Do not run HVAC. Call or text (616) 822-1978 immediately.</p>
</div>
${openings[v]}

${photoStripHTML(photos, name)}

<h2>Our Sewage Cleanup Process in ${name}</h2>
<ol>
  <li><strong>Immediate Containment:</strong> Poly barriers and negative air pressure isolation prevent cross-contamination of unaffected areas in your ${name} home.</li>
  <li><strong>Category 3 Extraction:</strong> Industrial truck-mount extractors remove all contaminated water and solid waste. All materials are handled and transported per Michigan biohazard regulations.</li>
  <li><strong>Required Demolition:</strong> All porous materials that contacted sewage — drywall, insulation, flooring, carpet — are removed. These cannot be safely cleaned and must be disposed of per biohazard protocol.</li>
  <li><strong>Hospital-Grade Sanitization:</strong> All structural surfaces are treated with EPA-registered disinfectants effective against sewage pathogens — not household bleach.</li>
  <li><strong>Deodorization:</strong> Hydroxyl generator and thermal fogging neutralize biological odors at the molecular level throughout the affected space.</li>
  <li><strong>Air Quality Clearance:</strong> Testing confirms the environment is safe for occupancy before reconstruction begins.</li>
  <li><strong>Complete Reconstruction:</strong> Michigan Builder's License — new drywall, flooring, insulation, and cabinetry to pre-loss condition. One company, start to finish.</li>
</ol>

<h2>Common Sewage Backup Causes in ${name}, MI</h2>
<ul>
  <li><strong>Municipal sewer surcharge:</strong> Heavy rain overwhelms city sewer capacity in ${county} County, forcing sewage back through floor drains and toilets</li>
  <li><strong>Tree root intrusion:</strong> Roots grow into and block sewer lateral lines between your home and the city main — common in older ${name} neighborhoods</li>
  <li><strong>Clogged sewer lateral:</strong> Accumulated grease, non-flushable wipes, and debris block the line</li>
  <li><strong>Sump pump failure:</strong> Without backup power or secondary pump, heavy rain events can overwhelm and back up through floor drain</li>
  <li><strong>Deteriorating pipe:</strong> Aging cast iron and clay sewer lines in ${county} County homes shift, crack, or collapse</li>
</ul>

<h2>Insurance Coverage for Sewage Backup in ${name}</h2>
<p>Standard homeowner's policies often exclude sewage backup — but many policies include a "water backup" endorsement that covers it. Check your declarations page. We document every aspect of the damage and prepare complete Xactimate claims for all major carriers.</p>

<div style="background:var(--bg-light);border-left:4px solid var(--accent);padding:1.25rem 1.5rem;border-radius:0 var(--radius-md) var(--radius-md) 0;margin:2rem 0;">
  <p style="margin:0;font-weight:600;">${quotes[v]}</p>
  <p style="margin:.5rem 0 0;font-size:.85rem;color:var(--text-muted);">— West Michigan homeowner · ★★★★★ Google Review</p>
</div>

${c.slug === 'grand-rapids-mi' ? grandRapidsBoost('sewage-cleanup') : ''}
<h2>Sewage Cleanup Questions — ${name}, MI</h2>
<div style="display:flex;flex-direction:column;gap:.75rem;margin-top:1rem;">
${faqs[v].join('\n')}
</div>`;
}

const BODY_BUILDERS = {
  'water-damage-restoration': waterBody,
  'fire-damage-restoration':  fireBody,
  'mold-remediation':         moldBody,
  'sewage-cleanup':           sewageBody,
};

const SERVICE_META = {
  'water-damage-restoration': { label:'Water Damage Restoration', hub:'/water-damage-restoration/', metaTitle:(c)=>`Water Damage Restoration ${c}, MI | Disaster Response by Ryan`, metaDesc:(c)=>`Water damage in ${c}, MI? Disaster Response by Ryan dispatches in ~60 min. IICRC certified. Direct insurance billing. Call or text (616) 822-1978.`, h1:(c)=>`Water Damage Restoration in ${c}, MI` },
  'fire-damage-restoration':  { label:'Fire & Smoke Damage Restoration', hub:'/fire-damage-restoration/', metaTitle:(c)=>`Fire & Smoke Damage Restoration ${c}, MI | Disaster Response by Ryan`, metaDesc:(c)=>`Fire or smoke damage in ${c}, MI? Disaster Response by Ryan responds 24/7. IICRC certified. Direct insurance billing. Call or text (616) 822-1978.`, h1:(c)=>`Fire & Smoke Damage Restoration in ${c}, MI` },
  'mold-remediation':         { label:'Mold Remediation', hub:'/mold-remediation/', metaTitle:(c)=>`Mold Remediation ${c}, MI | Disaster Response by Ryan`, metaDesc:(c)=>`Mold in your ${c}, MI home? IICRC certified mold remediation. Safe removal, air testing, clearance. Direct insurance billing. Call or text (616) 822-1978.`, h1:(c)=>`Mold Remediation in ${c}, MI` },
  'sewage-cleanup':           { label:'Sewage Cleanup', hub:'/sewage-cleanup/', metaTitle:(c)=>`Sewage Cleanup ${c}, MI | Disaster Response by Ryan`, metaDesc:(c)=>`Sewage backup in ${c}, MI? 24/7 Category 3 biohazard cleanup by Disaster Response by Ryan. Direct insurance billing. Call or text (616) 822-1978.`, h1:(c)=>`Sewage Cleanup in ${c}, MI` },
};



function grandRapidsBoost(svc) {
  const svcContent = {
    'water-damage-restoration': `
<h2>Water Damage in Grand Rapids — Neighborhood-Specific Risks</h2>
<p>Grand Rapids presents unique water damage risks by neighborhood. Heritage Hill's century-old cast iron supply lines fail without warning. The East Hills and Eastown areas sit near the Grand River flood plain. West Side homes face clay soil hydrostatic pressure pushing water through foundations year-round. Creston and Belknap Lookout properties have aging municipal infrastructure that surcharges during heavy rain events.</p>
<p>Grand Rapids also operates a <strong>combined sewer system (CSO)</strong> in older neighborhoods — when rainfall overwhelms capacity, sewage and stormwater back up together into basements. If your Grand Rapids home has experienced unexplained basement flooding during heavy rain, this is likely the cause. We handle Category 3 CSO backups under full biohazard protocol.</p>`,

    'fire-damage-restoration': `
<h2>Fire Damage Restoration in Grand Rapids — What We Handle</h2>
<p>Grand Rapids' building stock ranges from Heritage Hill Victorian homes built in the 1880s–1920s to mid-century ranch homes and modern construction. Each presents different fire restoration challenges. Historic homes in Heritage Hill, Midtown, and Creston often have knob-and-tube wiring behind restored plaster walls — electrical fires in these buildings require structural assessment before any restoration work begins. Older insulation materials, horsehair plaster, and original wood framing complicate scope and smoke penetration depth.</p>
<p>We work throughout all Grand Rapids neighborhoods including Heritage Hill, Eastown, East Hills, West Side, South Hill, Alger Heights, Garfield Park, Burton Heights, Creston, and the downtown core.</p>`,

    'mold-remediation': `
<h2>Why Grand Rapids Homes Are High-Risk for Mold</h2>
<p>Grand Rapids sits close enough to Lake Michigan to experience elevated year-round humidity — warm, moist air from the lake combined with frequent freeze-thaw cycles creates ideal conditions for mold growth. The city's clay-heavy soil prevents proper drainage, keeping foundations damp from March through November. Older neighborhoods like Heritage Hill, Eastown, and Creston have basements with fieldstone or poured concrete foundations built before modern waterproofing — moisture intrusion is a structural given, not an anomaly.</p>
<p>Grand Rapids' combined sewer system also contributes: basement flooding during CSO events introduces biological contamination that, if not properly remediated, leads to persistent mold growth in subfloor and wall assemblies. We serve all Grand Rapids zip codes and neighborhoods with IICRC S520-certified mold remediation.</p>`,

    'sewage-cleanup': `
<h2>Grand Rapids Sewage Backup — CSO System and What It Means for You</h2>
<p>Grand Rapids operates one of Michigan's largest <strong>combined sewer overflow (CSO)</strong> systems, serving much of the older city core. During heavy rainfall, stormwater and sanitary sewage share the same pipes — when that system surcharges, both flow backward into homes through floor drains, toilets, and sump basins. Neighborhoods most affected include Heritage Hill, East Hills, Eastown, Creston, West Side, and Belknap Lookout.</p>
<p>The City of Grand Rapids has issued CSO notifications multiple times in recent years. If your home experienced a "basement backup during a storm" — that was likely a CSO event. This is <strong>Category 3 black water</strong> regardless of how it looks or smells. We respond immediately with full biohazard protocol: extraction, demolition of all affected porous materials, EPA-registered disinfection, and IICRC-standard clearance before reconstruction.</p>`,
  };

  const neighborhoodGrid = `
<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:2rem;margin:2.5rem 0;">
  <h2 style="margin:0 0 1rem;font-size:1.4rem;">Grand Rapids Neighborhoods We Serve</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:.5rem .75rem;margin-bottom:1.25rem;">
    ${['Heritage Hill','Eastown','East Hills','Creston','Alger Heights','Garfield Park','West Side','South Hill','Burton Heights','Boston Square','Baxter','Belknap Lookout','Highland Park','Midtown','Monroe North','Near North Side','Wealthy Street','MLK Park','Oakdale Park','Westside Connection'].map(n=>`<span style="font-size:.88rem;font-weight:600;color:var(--text-main);">✓ ${n}</span>`).join('')}
  </div>
  <p style="margin:0;font-size:.88rem;color:var(--text-muted);"><strong style="color:var(--text-main);">Grand Rapids zip codes served:</strong> 49501 · 49503 · 49504 · 49505 · 49506 · 49507 · 49508 · 49509 · 49512 · 49525 · 49534 · 49546 · 49548</p>
</div>`;

  return (svcContent[svc] || '') + neighborhoodGrid;
}
const CITY_FAQ_SCHEMA = {
  'water-damage-restoration': [
    { q: "Will my homeowner's insurance cover water damage?", a: "Most policies cover sudden and accidental water damage — burst pipes, appliance failures, storm-driven rain. We handle direct billing to your carrier and prepare Xactimate documentation so your claim is fully supported." },
    { q: "How long does water damage restoration take?", a: "Structural drying takes 3–5 days for most jobs, depending on material types and saturation level. We monitor daily with calibrated moisture meters and remove equipment only when IICRC dry goals are confirmed." },
    { q: "Do you handle reconstruction after water damage?", a: "Yes — our Michigan Builder's License covers full structural reconstruction: drywall, insulation, flooring, cabinetry. One company, one contract, start to finish. No separate general contractor needed." },
    { q: "What does IICRC certified water damage restoration mean?", a: "IICRC (Institute of Inspection, Cleaning and Restoration Certification) sets the S500 standard for water damage restoration. Our technicians follow these protocols for moisture assessment, extraction, drying targets, and documentation — which matters for your insurance claim." },
  ],
  'fire-damage-restoration': [
    { q: "How quickly should fire damage restoration begin?", a: "Within hours. Soot and smoke residue begin permanently bonding to surfaces within hours of a fire. The sooner professional restoration begins, the more can be saved and the less replacement is required." },
    { q: "Does homeowner's insurance cover fire damage restoration?", a: "Yes — fire damage is typically a covered peril under standard homeowner's policies. We document everything and bill your carrier directly, preparing Xactimate estimates that match adjuster expectations." },
    { q: "Can smoke damage be fully removed?", a: "Yes — with the right chemistry and equipment. We use IICRC-approved methods for protein-based soot, standard soot, and smoke-infiltrated materials. Odor is neutralized at the molecular level with hydroxyl generators and thermal fogging, not just masked." },
    { q: "Do you handle both fire restoration and reconstruction?", a: "Yes. Our Michigan Builder's License covers full reconstruction after fire damage — drywall, flooring, cabinetry, painting — all under one contract. No separate contractor needed after we complete remediation." },
  ],
  'mold-remediation': [
    { q: "How do I know if I have mold in my home?", a: "Visible mold growth (black, green, white, or grey patches), a persistent musty odor, unexplained allergy-like symptoms, or a recent water damage event that was not professionally dried are all indicators. Mold often grows inside wall cavities where it's invisible — a professional inspection is the right starting point." },
    { q: "Is mold covered by homeowner's insurance?", a: "It depends on the cause. Mold resulting from a covered water loss (burst pipe, appliance failure, roof leak) is typically covered. Mold from long-term moisture or neglect often is not. We document the causal chain to support your claim." },
    { q: "How long does mold remediation take?", a: "A typical single-room remediation takes 1–3 days. Larger mold infestations involving multiple rooms or structural elements can take 5–10 days. Post-remediation air quality testing verifies clearance before reconstruction begins." },
    { q: "Can mold come back after remediation?", a: "Professionally remediated mold does not return if the moisture source is eliminated. We identify and address the root cause — not just the visible mold. IICRC S520 protocols and post-clearance air testing confirm the job is done correctly." },
  ],
  'sewage-cleanup': [
    { q: "Is sewage backup a health hazard?", a: "Yes — sewage is Category 3 black water containing bacteria (E. coli, Salmonella), viruses, and parasites. Direct contact causes illness. Do not attempt to clean it without proper PPE. Vacate the affected area and call immediately." },
    { q: "Does homeowner's insurance cover sewage backup?", a: "Standard policies often exclude sewage backup, but many include a water backup endorsement that covers it. Check your declarations page. We document everything and work directly with all major carriers on your claim." },
    { q: "What gets removed after a sewage backup?", a: "All porous materials that contacted sewage — drywall, insulation, flooring, carpet — must be removed and disposed of per biohazard protocol. These cannot be safely cleaned. Structural surfaces are then treated with EPA-registered disinfectants." },
    { q: "How long does sewage cleanup take?", a: "Emergency extraction and initial decontamination typically complete in 1–2 days. Full remediation including required demolition and structural drying takes additional time depending on scope. We rebuild everything using our Michigan Builder's License." },
  ],
};

function getNearby(svcSlug, cityIdx, count = 4) {
  const nearby = [];
  for (let i = 1; i <= 8 && nearby.length < count; i++) {
    const prev = CITIES[(cityIdx - i + CITIES.length) % CITIES.length];
    const next = CITIES[(cityIdx + i) % CITIES.length];
    if (!nearby.find(n => n.slug === prev.slug)) nearby.push(prev);
    if (nearby.length < count && !nearby.find(n => n.slug === next.slug)) nearby.push(next);
  }
  return nearby.slice(0, count);
}

function buildPage(svcSlug, cityIdx) {
  const city    = CITIES[cityIdx];
  const {name, county, minutes, slug: citySlug} = city;
  const cityData = CITIES_DATA.find(x => x.id === citySlug) || { lat: 43.0011, lng: -85.7335 };
  const svc     = SERVICE_META[svcSlug];
  const variant = cityIdx % 4;
  const depth   = '../../';

  const bodyFn   = BODY_BUILDERS[svcSlug];
  const bodyHTML = bodyFn(city, variant);
  const nearby   = getNearby(svcSlug, cityIdx);
  const heroPhoto = getPhotos(svcSlug, cityIdx, 1)[0];

  const canonical = `https://disaster911.net${svc.hub}${citySlug}/`;
  const title     = svc.metaTitle(name);
  const desc      = svc.metaDesc(name);
  const h1        = svc.h1(name);

  const nearbyHTML = nearby.map(c => `
    <a href="/${svcSlug}/${c.slug}/" class="nearby-link">
      <i class="fa-solid fa-location-dot" style="color:var(--accent);margin-right:.4rem;"></i>${c.name}, MI
    </a>`).join('');

  return `
<!DOCTYPE html>
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
    <meta property="og:image" content="https://disaster911.net/images/${heroPhoto.src}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="https://disaster911.net/images/${heroPhoto.src}">
    <meta name="geo.region" content="US-MI">
    <meta name="geo.placename" content="${name}, MI">
    <meta name="geo.position" content="${cityData.lat};${cityData.lng}">
    <meta name="ICBM" content="${cityData.lat}, ${cityData.lng}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="${depth}styles.css">
    <style>
        @media(max-width:768px){.page-grid{grid-template-columns:1fr!important;}.page-sidebar{position:static!important;}}
        .nearby-link{display:block;padding:.6rem 1rem;background:rgba(255,255,255,.05);border:1px solid var(--bg-subtle);border-radius:var(--radius-md);font-weight:600;font-size:.9rem;color:#fff;text-decoration:none;transition:border-color .2s;}
        .nearby-link:hover{border-color:var(--accent);}
    </style>
    <!-- GHL External Tracking -->
    <script src="https://link.msgsndr.com/js/traffic-source.js"></script>

    <script type="application/ld+json">
    [{
      "@context":"https://schema.org",
      "@type":"LocalBusiness",
      "name":"Disaster Response by Ryan",
      "telephone":"(616) 822-1978",
      "url":"https://disaster911.net",
      "address":{"@type":"PostalAddress","streetAddress":"3707 Northridge Dr NW STE 10","addressLocality":"Walker","addressRegion":"MI","postalCode":"49544"},
      "geo":{"@type":"GeoCoordinates","latitude":43.0011,"longitude":-85.7335},
      "openingHours":"Mo-Su 00:00-24:00",
      "priceRange":"$$",
      "areaServed":"${name}, MI",
      "image":"https://disaster911.net/images/moisture-meter-999-water-damage-wall-inspection-grand-rapids.jpg",
      "aggregateRating":{"@type":"AggregateRating","ratingValue":"5.0","reviewCount":"150","bestRating":"5"}
    },{
      "@context":"https://schema.org",
      "@type":"BreadcrumbList",
      "itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":"https://disaster911.net/"},
        {"@type":"ListItem","position":2,"name":"${svc.label}","item":"https://disaster911.net${svc.hub}"},
        {"@type":"ListItem","position":3,"name":"${h1}","item":"${canonical}"}
      ]
    },{
      "@context":"https://schema.org",
      "@type":"FAQPage",
      "mainEntity":${JSON.stringify(CITY_FAQ_SCHEMA[svcSlug].map(f=>({'@type':'Question','name':f.q,'acceptedAnswer':{'@type':'Answer','text':f.a}})))}
    }]
    </script>
</head>
<body>
    <div class="emergency-bar">
        <div class="container">
            <span><i class="fa-solid fa-triangle-exclamation"></i> 24/7/365 Emergency Response</span>
            <span><i class="fa-solid fa-truck-fast"></i> ~${minutes} min from ${name}</span>
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
                <a href="tel:6168221978" class="btn btn-primary btn-pulse">
                    <i class="fa-solid fa-phone"></i> (616) 822-1978
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
    </nav>
    <section class="hero">
        <div class="hero-overlay"></div>
        <div class="container hero-content">
            <div class="hero-text">
                <div class="hero-badges">
                    <span class="badge badge-blue"><i class="fa-solid fa-certificate"></i> IICRC Certified</span>
                    <span class="badge badge-orange"><i class="fa-solid fa-house-chimney"></i> MI Builder's License</span>
                    <span class="badge badge-green"><i class="fa-solid fa-clock"></i> ~${minutes} Min Away</span>
                </div>
                <h1>${h1} — <span class="highlight">24/7 Response</span></h1>
                <p class="subheadline">Family-owned since 1981. Dispatching from Walker, MI — Kent County's responsive restoration leaders.</p>
                <div class="hero-actions">
                    <a href="tel:6168221978" class="btn btn-primary btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call (616) 822-1978</a>
                    <a href="sms:6168221978" class="btn btn-secondary btn-large"><i class="fa-solid fa-comment-sms"></i> Text Us</a>
                </div>
                <p style="margin:.75rem 0 0;font-size:0.9rem;color:var(--text-muted);">Prefer to write? <a href="${depth}contact/" style="color:#fff;text-decoration:underline;font-weight:600;">Fill out our contact form</a> — we respond within the hour.</p>
            </div>
            <div class="hero-image-placeholder">
                <img src="/images/${heroPhoto.src}" alt="${heroPhoto.alt}" style="width:100%; height:100%; object-fit:cover; border-radius:var(--radius-xl);">
            </div>
        </div>
    </section>
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
        <div class="container">
            <ol class="breadcrumb">
                <li><a href="${depth}">Home</a></li>
                <li><a href="${depth}${svcSlug}/">${svc.label}</a></li>
                <li aria-current="page">${name}, MI</li>
            </ol>
        </div>
    </nav>
    <main class="page-content section-padding bg-light">
        <div class="container">
            <div class="page-grid" style="display:grid;grid-template-columns:1fr 300px;gap:2.5rem;align-items:start;">
                <div class="content-card" style="padding:2.5rem;">
                    ${bodyHTML}
                    <div style="margin-top:2.5rem;padding-top:2rem;border-top:1px solid var(--bg-subtle);">
                        <a href="${depth}${svcSlug}/" class="text-link"><i class="fa-solid fa-arrow-left"></i> Back to ${svc.label} Hub</a>
                    </div>
                </div>
                <aside class="page-sidebar" style="position:sticky;top:100px;display:flex;flex-direction:column;gap:1.5rem;">
                    <div style="background: rgba(255, 255, 255, 0.05);color: #fff;border-radius:var(--radius-lg);padding:1.5rem;text-align:center;">
                        <p style="font-weight:800;font-size:1.1rem;margin-bottom:.75rem;">Emergency in ${name}?</p>
                        <a href="tel:6168221978" class="btn btn-accent" style="width:100%;justify-content:center;margin-bottom:.75rem;display:flex;"><i class="fa-solid fa-phone"></i> (616) 822-1978</a>
                        <a href="sms:6168221978" style="display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.6rem;background:rgba(255,255,255,.1);border-radius:.5rem;color: #fff;text-decoration:none;font-weight:600;font-size:.9rem;"><i class="fa-solid fa-comment-sms"></i> Text Us</a>
                        <p style="font-size:.78rem;margin-top:.75rem;color:rgba(255,255,255,.7);">~${minutes} min from ${name} · 24/7/365</p>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05);border:1px solid var(--bg-subtle);border-radius:var(--radius-lg);padding:1.25rem;">
                        <p style="font-weight:700;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:1rem;">Certified &amp; Trusted</p>
                        <div style="display:flex;flex-direction:column;gap:.6rem;">
                            <div style="display:flex;align-items:center;gap:.6rem;font-size:.88rem;font-weight:600;"><i class="fa-solid fa-certificate" style="color:var(--accent);width:16px;"></i> IICRC Certified Firm</div>
                            <div style="display:flex;align-items:center;gap:.6rem;font-size:.88rem;font-weight:600;"><i class="fa-solid fa-hammer" style="color:var(--accent);width:16px;"></i> MI Builder's License</div>
                            <div style="display:flex;align-items:center;gap:.6rem;font-size:.88rem;font-weight:600;"><i class="fa-solid fa-star" style="color:#fbbc05;width:16px;"></i> 5.0 Google Rating</div>
                            <div style="display:flex;align-items:center;gap:.6rem;font-size:.88rem;font-weight:600;"><i class="fa-solid fa-shield-halved" style="color:var(--accent);width:16px;"></i> BBB A+ Accredited</div>
                            <div style="display:flex;align-items:center;gap:.6rem;font-size:.88rem;font-weight:600;"><i class="fa-solid fa-wind" style="color:var(--accent);width:16px;"></i> Phoenix Equipment</div>
                        </div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05);border:1px solid var(--bg-subtle);border-radius:var(--radius-lg);padding:1.25rem;">
                        <p style="font-weight:700;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:.75rem;">Direct Insurance Billing</p>
                        <p style="font-size:.82rem;line-height:1.8;color:var(--text-main);">State Farm · Allstate · Farmers · Liberty Mutual · USAA · Nationwide · Travelers · Auto-Owners · Erie · Cincinnati Financial · Hanover · Auto Club (AAA)</p>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05);border:1px solid var(--bg-subtle);border-radius:var(--radius-lg);padding:1.25rem;">
                        <p style="font-weight:700;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:.75rem;">Also Serving Nearby</p>
                        <div style="display:flex;flex-direction:column;gap:.5rem;">${nearbyHTML}</div>
                        <a href="${depth}service-areas/" style="display:block;margin-top:.75rem;font-size:.82rem;color:var(--accent);font-weight:600;text-decoration:none;">View all 51 service areas →</a>
                    </div>
                </aside>
            </div>
        </div>
    </main>

    <!-- Reviews Section -->
    <section class="reviews section-padding" style="background: var(--bg-deep);">
      <div class="container">
        <div class="section-header center" style="margin-bottom: 4rem;">
          <div
            class="rating-badge-premium"
            style="
              display: inline-flex;
              align-items: center;
              gap: 0.75rem;
              background: rgba(220, 38, 38, 0.1);
              padding: 0.5rem 1.25rem;
              border-radius: 100px;
              border: 1px solid rgba(220, 38, 38, 0.2);
              margin-bottom: 1.5rem;
            "
          >
            <span style="display: flex; gap: 2px;">
              <i class="fa-solid fa-star" style="color: #fbbc05; font-size: 0.85rem"></i>
              <i class="fa-solid fa-star" style="color: #fbbc05; font-size: 0.85rem"></i>
              <i class="fa-solid fa-star" style="color: #fbbc05; font-size: 0.85rem"></i>
              <i class="fa-solid fa-star" style="color: #fbbc05; font-size: 0.85rem"></i>
              <i class="fa-solid fa-star" style="color: #fbbc05; font-size: 0.85rem"></i>
            </span>
            <span style="font-weight: 800; color: #fff; font-size: 0.95rem;">
              <span id="gr-rating-score">5.0</span>/5.0
            </span>
            <span id="gr-rating-total" style="font-size: 0.85rem; color: var(--text-muted); border-left: 1px solid rgba(255,255,255,0.1); padding-left: 0.75rem;">150+ Reviews</span>
          </div>
          <h2 style="font-size: 2.75rem; margin-bottom: 1rem;">What West Michigan Homeowners Say</h2>
          <p class="lead" style="margin: 0 auto;">
            Real reviews from real families we've helped across Grand Rapids and
            beyond.
          </p>
        </div>

        <div
          id="gr-reviews-grid"
          class="review-grid"
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
          "
        >
          <!-- Real Reviews Dynamically Loaded from google-reviews.js -->
        </div>
      </div>
    </section>
    <footer class="site-footer">
        <div class="container footer-inner">
            <div class="footer-col">
                <div class="footer-logo" style="margin-bottom: 1.5rem;">
                    <a href="/"><img src="/images/logo.png" alt="Disaster Response by Ryan Logo" width="240" height="65" style="object-fit: contain; filter: brightness(0) invert(1);"></a>
                </div>
                <p>Family-owned restoration serving West Michigan since 1981. Same crew, start to finish.</p>
                <div class="footer-badges" style="display:flex; gap:1rem; margin-top:1rem;">
                    <a href="https://iicrc.org" target="_blank" rel="noopener"><img src="/images/iicrc-badge.svg" alt="IICRC Certified" width="50" height="50"></a>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
                        <img src="/images/mi-builder-badge.svg" alt="MI Builder's License" width="50" height="50">
                        <span style="font-size:0.6rem; font-weight:700; color:var(--text-muted);">#2101187907</span>
                    </div>
                </div>
            </div>
            <div class="footer-col">
                <h3>Contact</h3>
                <address class="nap">
                    Disaster Response by Ryan<br>3707 Northridge Dr NW STE 10<br>Walker, MI 49544<br>
                    <a href="tel:6168221978">(616) 822-1978</a><br>
                    <a href="mailto:rpenny@disaster911.net">rpenny@disaster911.net</a>
                </address>
                <div class="mt-2 text-sm"><strong>24/7 Emergency Service</strong></div>
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
                <h3 style="margin-top:1.5rem;">Sister Company</h3>
                <ul class="footer-links">
                    <li><a href="https://rentalexdumpstergr.com" target="_blank" rel="noopener"><i class="fa-solid fa-dumpster" style="margin-right:.35rem;"></i>Rentalex Dumpster GR</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>Top Service Areas</h3>
                <ul class="footer-links">
                    <li><a href="${depth}water-damage-restoration/grand-rapids-mi/">Grand Rapids, MI</a></li>
                    <li><a href="${depth}water-damage-restoration/rockford-mi/">Rockford, MI</a></li>
                    <li><a href="${depth}water-damage-restoration/kentwood-mi/">Kentwood, MI</a></li>
                    <li><a href="${depth}water-damage-restoration/holland-mi/">Holland, MI</a></li>
                    <li><a href="${depth}service-areas/">View All 51 Cities</a></li>
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
        <a href="tel:6168221978" class="mfc-call"><i class="fa-solid fa-phone"></i> Call</a>
        <a href="sms:6168221978" class="mfc-text"><i class="fa-solid fa-comment-sms"></i> Text</a>
    </div>
    <script src="${depth}script.js"></script>
    <script src="/google-reviews.js" defer></script>
</body>
</html>`;
}

// ─── RUN ──────────────────────────────────────────────────────────────────────
const ROOT = __dirname;
const SVCS = Object.keys(SERVICE_META);
let built = 0, skipped = 0;

for (const svcSlug of SVCS) {
  for (let i = 0; i < CITIES.length; i++) {
    const citySlug = CITIES[i].slug;
    const dir = path.join(ROOT, svcSlug, citySlug);
    if (!fs.existsSync(dir)) { skipped++; continue; }
    fs.writeFileSync(path.join(dir, 'index.html'), buildPage(svcSlug, i), 'utf8');
    built++;
    process.stdout.write(`\r  Built ${built} pages...`);
  }
}

console.log(`\n\n✅  Done. ${built} city pages rebuilt. ${skipped} dirs skipped.`);
