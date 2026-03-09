/**
 * script.js — Disaster Response by Ryan
 * Handles: FAQ accordion, mobile menu, header scroll, contact forms, smooth scroll
 *
 * =========================================================
 * GHL INTEGRATIONS — FILL IN YOUR IDs BELOW
 * =========================================================
 *
 * 1. WEBHOOK URL
 *    GHL → Settings → Integrations → Webhooks → Create webhook
 *    Select trigger: "Contact Form Submission" (or "Inbound Webhook")
 *    Paste the webhook URL below.
 *
 * 2. LOCATION ID
 *    GHL → Settings → Business Profile → scroll to "Location ID"
 *    Powers: Chat Widget
 *
 * 3. CHAT WIDGET
 *    GHL → Sites → Chat Widget → Create/configure your widget
 *    Set GHL_CHAT_ENABLED = true once you have a Location ID.
 *
 * 4. CALENDAR
 *    GHL → Calendars → select your calendar → Share / Embed
 *    Copy the calendar slug/ID and paste into contact/index.html
 *    where you see GHL_CALENDAR_ID_HERE.
 *
 * =========================================================
 */

// ── GHL Configuration ──────────────────────────────────────────────────────

// Paste your GHL webhook URL here (from Settings → Integrations → Webhooks):
const GHL_WEBHOOK_URL = 'YOUR_GHL_WEBHOOK_URL_HERE';

// Paste your GHL Location ID here (from Settings → Business Profile → Location ID):
const GHL_LOCATION_ID = 'YOUR_GHL_LOCATION_ID_HERE';

// Set to true once GHL_LOCATION_ID is filled in:
const GHL_CHAT_ENABLED = false;

// Set to false to disable the exit-intent popup:
const GHL_EXIT_INTENT_ENABLED = true;

// ── Site Contact Info ────────────────────────────────────────────────────────
const PHONE_DISPLAY = '(616) 822-1978';
const PHONE_LINK    = '6168221978';

// ============================================================================
// UTM PARAMETER CAPTURE
// Reads UTM params from the current URL, stores them in sessionStorage, and
// attaches them to every GHL form submission for source/campaign attribution.
// ============================================================================

function captureUTMParams() {
    const params  = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    utmKeys.forEach(key => {
        const val = params.get(key);
        if (val) sessionStorage.setItem('ghl_' + key, val);
    });
    // Store first-touch landing page (only if not already set)
    if (!sessionStorage.getItem('ghl_landing_page')) {
        sessionStorage.setItem('ghl_landing_page', window.location.href);
    }
    // Always update last-touch page
    sessionStorage.setItem('ghl_last_page', window.location.href);
}

function getStoredUTMParams() {
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    const result  = {};
    utmKeys.forEach(key => {
        const val = sessionStorage.getItem('ghl_' + key);
        if (val) result[key] = val;
    });
    return result;
}

// Run immediately on every page load (before DOMContentLoaded)
captureUTMParams();

// ============================================================================
// GHL CHAT WIDGET INJECTION
// Dynamically appends the GHL floating chat bubble to every page.
// No HTML file changes needed — script.js is already on all 226 pages.
// GHL requires window.hl_chatWidget to be set BEFORE the loader script runs.
// ============================================================================

function loadGHLChatWidget() {
    if (!GHL_CHAT_ENABLED) return;
    if (!GHL_LOCATION_ID || GHL_LOCATION_ID === 'YOUR_GHL_LOCATION_ID_HERE') {
        console.warn('[GHL] Chat widget: set GHL_LOCATION_ID in script.js to enable.');
        return;
    }

    // Config object must exist before the loader runs
    window.hl_chatWidget = { locationId: GHL_LOCATION_ID };

    const script = document.createElement('script');
    script.src   = 'https://widgets.leadconnectorhq.com/loader.js';
    script.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
    script.async = true;
    document.body.appendChild(script);
}

// ============================================================================
// EXIT INTENT POPUP
// Desktop: triggers when mouse moves above the viewport (toward browser tabs).
// Mobile:  triggers after 30 seconds on-page (no mouse data available).
// Only fires once per session. Minimum 8 seconds on-page before it can trigger.
// Submits lead to GHL via webhook with source = "Exit Intent Popup".
// ============================================================================

function setupExitIntent() {
    if (!GHL_EXIT_INTENT_ENABLED) return;
    if (sessionStorage.getItem('ghl_exit_shown')) return; // already fired this session

    let minTimeElapsed = false;
    let popupShown     = false;

    setTimeout(() => { minTimeElapsed = true; }, 8000);

    function showExitPopup() {
        if (popupShown || !minTimeElapsed) return;
        popupShown = true;
        sessionStorage.setItem('ghl_exit_shown', '1');

        // Inject animation keyframes once
        if (!document.getElementById('ghl-exit-styles')) {
            const style = document.createElement('style');
            style.id    = 'ghl-exit-styles';
            style.textContent = `
                @keyframes ghlFadeIn  { from { opacity:0 }              to { opacity:1 } }
                @keyframes ghlSlideUp { from { transform:translateY(24px); opacity:0 } to { transform:translateY(0); opacity:1 } }
                #ghl-exit-overlay *  { box-sizing: border-box; }
                #ghl-exit-form input::placeholder,
                #ghl-exit-form select { color: #9ca3af; }
                #ghl-exit-form select option { background: #1a1f2e; color: #fff; }
                #ghl-exit-form input:focus,
                #ghl-exit-form select:focus { outline:none; border-color:#3b82f6 !important; }
            `;
            document.head.appendChild(style);
        }

        const overlay = document.createElement('div');
        overlay.id    = 'ghl-exit-overlay';
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.78)',
            'z-index:99999', 'display:flex', 'align-items:center',
            'justify-content:center', 'padding:1rem',
            'animation:ghlFadeIn .2s ease'
        ].join(';');

        overlay.innerHTML = `
            <div style="
                background:#1a1f2e; border:1px solid rgba(255,255,255,0.1);
                border-radius:1rem; max-width:460px; width:100%; padding:2.25rem;
                position:relative; box-shadow:0 25px 60px rgba(0,0,0,0.55);
                animation:ghlSlideUp .3s ease;
            ">
                <!-- Close button -->
                <button id="ghl-exit-close" aria-label="Close popup" style="
                    position:absolute; top:.875rem; right:.875rem; background:none;
                    border:none; color:#6b7280; font-size:1.6rem; cursor:pointer;
                    line-height:1; padding:.25rem .5rem; border-radius:.25rem;
                    transition:color .15s;
                " onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#6b7280'">&times;</button>

                <!-- Header -->
                <div style="text-align:center; margin-bottom:1.75rem;">
                    <div style="
                        width:58px; height:58px; background:#ef4444; border-radius:50%;
                        display:flex; align-items:center; justify-content:center;
                        margin:0 auto 1rem;
                    ">
                        <i class="fa-solid fa-house-flood-water" style="font-size:1.4rem; color:#fff;"></i>
                    </div>
                    <h2 style="margin:0 0 .5rem; font-size:1.4rem; color:#fff; font-family:Montserrat,sans-serif;">
                        Wait — Need Emergency Help?
                    </h2>
                    <p style="color:#9ca3af; margin:0; font-size:.9rem; line-height:1.5;">
                        Leave your number and Ryan calls back <strong style="color:#fff;">within minutes</strong>, 24/7.
                    </p>
                </div>

                <!-- Form -->
                <form id="ghl-exit-form" novalidate style="display:grid; gap:.75rem;">
                    <input type="text" id="ghl-exit-name" placeholder="Your Name *" autocomplete="name" style="
                        width:100%; padding:.75rem 1rem; background:#0f1623;
                        border:1px solid rgba(255,255,255,0.12); border-radius:.5rem;
                        color:#fff; font-size:.95rem;
                    ">
                    <input type="tel" id="ghl-exit-phone" placeholder="Phone Number *" autocomplete="tel" style="
                        width:100%; padding:.75rem 1rem; background:#0f1623;
                        border:1px solid rgba(255,255,255,0.12); border-radius:.5rem;
                        color:#fff; font-size:.95rem;
                    ">
                    <select id="ghl-exit-service" style="
                        width:100%; padding:.75rem 1rem; background:#0f1623;
                        border:1px solid rgba(255,255,255,0.12); border-radius:.5rem;
                        font-size:.95rem; appearance:none; cursor:pointer;
                    ">
                        <option value="">Type of Damage (optional)</option>
                        <option value="Water Damage">Water Damage</option>
                        <option value="Fire &amp; Smoke Damage">Fire &amp; Smoke Damage</option>
                        <option value="Mold Remediation">Mold Remediation</option>
                        <option value="Sewage Cleanup">Sewage Cleanup</option>
                        <option value="Not Sure / Other">Not Sure / Other</option>
                    </select>
                    <button id="ghl-exit-submit" type="submit" style="
                        width:100%; padding:.875rem; background:#ef4444; color:#fff;
                        border:none; border-radius:.5rem; font-size:1rem; font-weight:700;
                        cursor:pointer; display:flex; align-items:center;
                        justify-content:center; gap:.5rem; transition:background .15s;
                    " onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
                        <i class="fa-solid fa-paper-plane"></i> Get a Free Callback
                    </button>
                    <p id="ghl-exit-error" style="display:none; color:#f87171; font-size:.85rem; margin:0; text-align:center;"></p>
                </form>

                <!-- Direct call fallback -->
                <div style="
                    text-align:center; margin-top:1.25rem; padding-top:1.25rem;
                    border-top:1px solid rgba(255,255,255,0.08);
                ">
                    <p style="color:#6b7280; font-size:.8rem; margin:0 0 .4rem;">Or call Ryan directly — he picks up:</p>
                    <a href="tel:${PHONE_LINK}" style="font-size:1.35rem; font-weight:800; color:#60a5fa; text-decoration:none;">
                        ${PHONE_DISPLAY}
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // ── Close handlers ──
        document.getElementById('ghl-exit-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.remove(); }, { once: true });

        // ── Exit form submission ──
        document.getElementById('ghl-exit-form').addEventListener('submit', async e => {
            e.preventDefault();
            const name   = document.getElementById('ghl-exit-name').value.trim();
            const phone  = document.getElementById('ghl-exit-phone').value.trim();
            const svc    = document.getElementById('ghl-exit-service').value;
            const errEl  = document.getElementById('ghl-exit-error');
            const btn    = document.getElementById('ghl-exit-submit');

            if (!name || !phone) {
                errEl.textContent   = 'Please enter your name and phone number.';
                errEl.style.display = 'block';
                if (!name) document.getElementById('ghl-exit-name').focus();
                else document.getElementById('ghl-exit-phone').focus();
                return;
            }

            errEl.style.display = 'none';
            btn.disabled        = true;
            btn.innerHTML       = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

            try {
                await submitToGHL({
                    name,
                    phone,
                    service:      svc,
                    source:       'Exit Intent Popup',
                    page_url:     window.location.href,
                    page_title:   document.title,
                    referrer:     document.referrer || '',
                    ...getStoredUTMParams()
                });

                // Replace form with success state
                const formEl  = document.getElementById('ghl-exit-form');
                const safeName  = escapeHTML(name);
                const safePhone = escapeHTML(phone);
                formEl.outerHTML = `
                    <div style="text-align:center; padding:.75rem 0 .5rem;">
                        <i class="fa-solid fa-circle-check" style="font-size:2.5rem; color:#22c55e; display:block; margin-bottom:.75rem;"></i>
                        <h3 style="margin:0 0 .4rem; color:#fff;">Got it, ${safeName}!</h3>
                        <p style="color:#9ca3af; margin:0 0 1rem;">Ryan will call <strong style="color:#fff;">${safePhone}</strong> shortly.</p>
                        <a href="tel:${PHONE_LINK}" style="
                            display:inline-flex; align-items:center; gap:.4rem;
                            background:#3b82f6; color:#fff; padding:.6rem 1.25rem;
                            border-radius:.5rem; font-weight:700; text-decoration:none; font-size:.9rem;
                        "><i class="fa-solid fa-phone"></i> Call Now If Urgent</a>
                    </div>
                `;
                setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 6000);

            } catch {
                btn.disabled  = false;
                btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Get a Free Callback';
                errEl.textContent   = 'Something went wrong. Please call (616) 822-1978 directly.';
                errEl.style.display = 'block';
            }
        });
    }

    // Desktop: mouse exits toward top of screen (browser chrome / new tab)
    document.addEventListener('mouseleave', e => {
        if (e.clientY < 5) showExitPopup();
    });

    // Mobile fallback: trigger after 30 seconds on-page
    const mobileFallback = setTimeout(() => showExitPopup(), 30000);

    // Cancel mobile timer if user already triggered desktop exit intent
    document.addEventListener('mouseleave', () => clearTimeout(mobileFallback), { once: true });
}

// ============================================================================
// GHL WEBHOOK SUBMISSION
// Sends form data to GoHighLevel via the configured webhook URL.
// GHL receives the JSON payload and creates/updates a contact in your CRM,
// then can trigger automations (SMS, email follow-up, pipeline assignment, etc.)
// ============================================================================

async function submitToGHL(formData) {
    if (!GHL_WEBHOOK_URL || GHL_WEBHOOK_URL === 'YOUR_GHL_WEBHOOK_URL_HERE') {
        console.warn('[GHL] No webhook URL configured. Set GHL_WEBHOOK_URL in script.js.');
        return { ok: true, fallback: true };
    }

    const response = await fetch(GHL_WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData)
    });

    return response;
}

// ============================================================================
// XSS PROTECTION — escapes user input before inserting into HTML
// ============================================================================

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================================
// CONTACT FORM HANDLER
// Works for all forms on the site. Enriches every submission with:
//   - UTM attribution data (utm_source, utm_medium, utm_campaign, etc.)
//   - Landing page + referring page
//   - Page title and current URL
//   - Submission timestamp (ISO)
// ============================================================================

function setupContactForm(formEl) {
    if (!formEl) return;

    formEl.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nameEl    = formEl.querySelector('[id$="-name"]');
        const phoneEl   = formEl.querySelector('[id$="-phone"]');
        const emailEl   = formEl.querySelector('[id$="-email"]');
        const serviceEl = formEl.querySelector('[id$="-service"]');
        const messageEl = formEl.querySelector('[id$="-message"]');

        // Basic validation — name and phone required
        if (!nameEl || !phoneEl || !nameEl.value.trim() || !phoneEl.value.trim()) {
            const firstRequired = !nameEl?.value.trim() ? nameEl : phoneEl;
            if (firstRequired) {
                firstRequired.style.borderColor = '#ef4444';
                firstRequired.focus();
                let fieldErr = firstRequired.parentElement.querySelector('.field-error');
                if (!fieldErr) {
                    fieldErr = document.createElement('p');
                    fieldErr.className = 'field-error';
                    fieldErr.style.cssText = 'color:#ef4444;font-size:.85rem;margin:.3rem 0 0;';
                    firstRequired.parentElement.appendChild(fieldErr);
                }
                fieldErr.textContent = firstRequired === nameEl
                    ? 'Please enter your name.'
                    : 'Please enter your phone number.';
            }
            return;
        }

        // Loading state
        const submitBtn       = formEl.querySelector('[type="submit"]');
        const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        }

        // Build enriched payload
        const payload = {
            // Core contact data
            name:         nameEl.value.trim(),
            phone:        phoneEl.value.trim(),
            email:        emailEl   ? emailEl.value.trim() : '',
            service:      serviceEl ? serviceEl.value      : '',
            message:      messageEl ? messageEl.value.trim() : '',

            // Attribution & routing
            source:       'Website Contact Form',
            page_url:     window.location.href,
            page_title:   document.title,
            referrer:     document.referrer || '',
            landing_page: sessionStorage.getItem('ghl_landing_page') || window.location.href,
            submitted_at: new Date().toISOString(),

            // UTM data (populated if visitor came from an ad or link)
            ...getStoredUTMParams()
        };

        try {
            await submitToGHL(payload);

            const safeName  = escapeHTML(payload.name);
            const safePhone = escapeHTML(payload.phone);
            formEl.innerHTML = `
                <div style="text-align:center; padding:3rem 1rem;">
                    <i class="fa-solid fa-circle-check" style="font-size:3.5rem; color:#22c55e; margin-bottom:1.25rem; display:block;"></i>
                    <h3 style="margin-bottom:.5rem;">Got it, ${safeName}!</h3>
                    <p style="margin-bottom:1.5rem; color:var(--text-muted);">We'll call <strong style="color:#fff;">${safePhone}</strong> back shortly. For emergencies, reach us directly:</p>
                    <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
                        <a href="tel:${PHONE_LINK}" class="btn btn-primary"><i class="fa-solid fa-phone"></i> Call ${PHONE_DISPLAY}</a>
                        <a href="sms:${PHONE_LINK}" class="btn btn-secondary"><i class="fa-solid fa-comment-sms"></i> Text Us</a>
                    </div>
                </div>`;

        } catch (err) {
            console.error('[GHL] Form submission failed:', err);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
            }
            let errMsg = formEl.querySelector('.form-error');
            if (!errMsg) {
                errMsg = document.createElement('p');
                errMsg.className   = 'form-error';
                errMsg.style.cssText = 'color:#ef4444; margin-top:.75rem; text-align:center; font-size:.9rem;';
                formEl.appendChild(errMsg);
            }
            errMsg.textContent = 'Oops — something went wrong. Please call us at (616) 822-1978.';
        }
    });
}

// ============================================================================
// INIT — runs after DOM is ready
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── FAQ Accordion ────────────────────────────────────────────────────────
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const isActive = question.classList.contains('active');

            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
                const ans = q.nextElementSibling;
                if (ans) { ans.style.maxHeight = null; ans.classList.remove('open'); }
            });

            if (!isActive) {
                question.classList.add('active');
                const answer = question.nextElementSibling;
                if (answer) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    answer.classList.add('open');
                }
            }
        });
    });

    // ── Header Scroll Shrink ─────────────────────────────────────────────────
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 80);
        });
    }

    // ── Mobile Menu Toggle ───────────────────────────────────────────────────
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav  = document.querySelector('.mobile-nav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const icon   = menuToggle.querySelector('i');
            const isOpen = mobileNav.classList.contains('active');
            icon.classList.toggle('fa-bars',  !isOpen);
            icon.classList.toggle('fa-times',  isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    // ── Contact Form Handlers ────────────────────────────────────────────────
    setupContactForm(document.getElementById('contact-form'));        // /contact/ page
    setupContactForm(document.getElementById('home-contact-form'));   // Homepage main form
    setupContactForm(document.getElementById('home-contact-form-2')); // Homepage sidebar form

    // ── GHL Chat Widget ──────────────────────────────────────────────────────
    loadGHLChatWidget();

    // ── Exit Intent Popup ────────────────────────────────────────────────────
    setupExitIntent();

    // ── Scroll-triggered Animations ──────────────────────────────────────────
    if ('IntersectionObserver' in window) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view', 'visible');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.fade-up, .animate-on-scroll').forEach(el => {
            scrollObserver.observe(el);
        });
    } else {
        document.querySelectorAll('.fade-up, .animate-on-scroll').forEach(el => {
            el.classList.add('in-view', 'visible');
        });
    }

    // ── Smooth Scrolling ─────────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') { e.preventDefault(); return; }

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();

            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                const icon = menuToggle?.querySelector('i');
                if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
                document.body.style.overflow = '';
            }

            targetElement.scrollIntoView({ behavior: 'smooth' });
        });
    });

});
