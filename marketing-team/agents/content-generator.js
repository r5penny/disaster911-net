/**
 * content-generator.js
 *
 * Uses the Anthropic Claude API (claude-haiku-4-5-20251001) to generate marketing
 * content for Disaster Response by Ryan. Cost-efficient model optimized for
 * high-volume content generation tasks.
 *
 * Functions exported:
 *   generateGBPPost(type)                     — GBP post for a service type
 *   generateReviewReply(reviewText, rating)   — Professional review response
 *   generateBacklinkOutreachEmail(directory)  — Directory submission email
 *   generateFAQAnswer(question)               — AEO-optimized FAQ answer
 */

'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const chalk     = require('chalk');
const { config, BUSINESS, validateCredentials } = require('../config');

// Valid GBP post types
const POST_TYPES = ['water_damage', 'fire_damage', 'mold', 'sewage', 'tip', 'testimonial', 'seasonal'];

// Service display names mapped from slug-style keys
const SERVICE_NAMES = {
  water_damage: 'Water Damage Restoration',
  fire_damage:  'Fire Damage Restoration',
  mold:         'Mold Remediation',
  sewage:       'Sewage Cleanup',
  tip:          'Restoration Tips',
  testimonial:  'Customer Success Story',
  seasonal:     'Seasonal Alert',
};

// CTA URLs by service
const CTA_URLS = {
  water_damage: 'https://disaster911.net/water-damage-restoration/',
  fire_damage:  'https://disaster911.net/fire-damage-restoration/',
  mold:         'https://disaster911.net/mold-remediation/',
  sewage:       'https://disaster911.net/sewage-cleanup/',
  tip:          'https://disaster911.net/',
  testimonial:  'https://disaster911.net/',
  seasonal:     'https://disaster911.net/',
};

/**
 * getClient
 * Returns an Anthropic client instance if the API key is configured.
 * Returns null with a warning if credentials are missing.
 */
function getClient() {
  const { valid } = validateCredentials(['ANTHROPIC_API_KEY']);
  if (!valid) {
    console.warn(chalk.yellow(
      'Content Generator: ANTHROPIC_API_KEY not set in config.js. ' +
      'AI content generation is disabled.'
    ));
    return null;
  }
  return new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
}

/**
 * callClaude
 * Sends a prompt to Claude and returns the response text.
 * Handles rate limiting with exponential backoff (up to 3 retries).
 */
async function callClaude(systemPrompt, userPrompt, maxTokens = 600) {
  const client = getClient();
  if (!client) {
    throw new Error('Anthropic API key not configured. Please set ANTHROPIC_API_KEY in config.js.');
  }

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const message = await client.messages.create({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        system:     systemPrompt,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      });

      return message.content[0].text.trim();
    } catch (err) {
      lastError = err;
      // Rate limit (429) or overload (529) — wait and retry
      if (err.status === 429 || err.status === 529) {
        const waitMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(chalk.yellow(`Rate limited. Waiting ${waitMs / 1000}s before retry ${attempt}/3...`));
        await new Promise(r => setTimeout(r, waitMs));
      } else {
        // Non-retryable error
        throw err;
      }
    }
  }
  throw lastError;
}

// ── System Prompts ────────────────────────────────────────────────────────────

const GBP_POST_SYSTEM = `You are a local marketing expert writing Google Business Profile posts for
Disaster Response by Ryan, an IICRC-certified disaster restoration company in Walker / Grand Rapids, MI.

Business info:
- Name: ${BUSINESS.name}
- Phone: ${BUSINESS.phone}
- Website: ${BUSINESS.website}
- Rating: ${BUSINESS.rating} stars / ${BUSINESS.reviewCount}+ reviews
- Owner: ${BUSINESS.owner}
- Certifications: ${BUSINESS.certifications.join(', ')}
- Service area: ${BUSINESS.serviceArea}

Post requirements:
- Under 1,500 characters total
- Professional but urgent tone — restoration emergencies are stressful
- Mention Grand Rapids or West Michigan naturally
- End with a clear call to action (phone number or website)
- Do NOT use excessive emojis (1–2 max)
- Do NOT use all-caps words
- Respond ONLY with a JSON object. No markdown. No explanation.`;

const REVIEW_REPLY_SYSTEM = `You are Ryan Penny, owner of Disaster Response by Ryan in Walker, MI.
You are writing a personalized, professional reply to a Google review.

Requirements:
- Sign off as "— Ryan Penny, Owner" at the end
- Mention something specific from the review if possible
- Thank the reviewer warmly and specifically (not generic)
- Under 200 words
- Professional, genuine, warm tone — not corporate
- Do NOT use excessive marketing language
- If the review mentions a specific service or technician, acknowledge it
- Respond ONLY with the reply text. No JSON. No explanation.`;

const OUTREACH_SYSTEM = `You are writing a professional business listing submission email for
Disaster Response by Ryan (disaster911.net), an IICRC-certified restoration company in Walker, MI.

Business NAP:
- Name: ${BUSINESS.name}
- Address: ${BUSINESS.address.full}
- Phone: ${BUSINESS.phone}
- Website: ${BUSINESS.website}
- Email: ${BUSINESS.email}
- Owner: ${BUSINESS.owner}
- Certifications: ${BUSINESS.certifications.join(', ')}
- Rating: ${BUSINESS.rating} stars / ${BUSINESS.reviewCount}+ reviews

Requirements:
- Professional, concise (under 300 words)
- Include all NAP fields clearly
- Mention IICRC certification and 5-star rating
- Include a specific ask (add/update listing)
- Respond ONLY with the email text (subject line first, then body). No explanation.`;

const FAQ_SYSTEM = `You are an SEO/AEO content expert writing FAQ answers for Disaster Response by Ryan,
an IICRC-certified restoration company in Walker / Grand Rapids, MI.

Business info:
- Phone: ${BUSINESS.phone}
- Website: ${BUSINESS.website}
- Services: Water Damage, Fire Damage, Mold Remediation, Sewage Cleanup
- Area: Grand Rapids, Walker, Kent County, West Michigan
- Available: 24/7 for emergencies

Requirements for each answer:
- 40–80 words (optimized for Google's featured snippets / AI overviews)
- Start with a direct, definitive sentence answering the question
- Include a relevant local detail (city name, service area)
- End with a soft CTA (phone or website)
- Do NOT use bullet points — write as prose
- Respond ONLY with the answer text. No explanation. No JSON.`;

// ── Exported Functions ────────────────────────────────────────────────────────

/**
 * generateGBPPost
 * Generates a Google Business Profile post for a specific service type.
 * type: 'water_damage' | 'fire_damage' | 'mold' | 'sewage' | 'tip' | 'testimonial' | 'seasonal'
 *
 * Returns: { title, summary, callToAction, callToActionUrl }
 */
async function generateGBPPost(type) {
  if (!POST_TYPES.includes(type)) {
    throw new Error(`Invalid post type "${type}". Valid types: ${POST_TYPES.join(', ')}`);
  }

  try {
    console.log(chalk.cyan(`Generating GBP post: ${SERVICE_NAMES[type]}...`));

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const currentYear  = new Date().getFullYear();

    let userPrompt;

    switch (type) {
      case 'water_damage':
        userPrompt = `Write a GBP post about water damage restoration services.
Mention that we're available 24/7 for emergency flooding, burst pipes, or appliance leaks.
Reference Grand Rapids or West Michigan. Include our phone number.
Return JSON: { "title": "...", "summary": "...", "callToAction": "Call Now", "callToActionUrl": "${CTA_URLS.water_damage}" }`;
        break;

      case 'fire_damage':
        userPrompt = `Write a GBP post about fire and smoke damage restoration.
Mention board-up, smoke odor elimination, and content restoration.
Reference Grand Rapids or West Michigan. Include our phone number.
Return JSON: { "title": "...", "summary": "...", "callToAction": "Get Help Now", "callToActionUrl": "${CTA_URLS.fire_damage}" }`;
        break;

      case 'mold':
        userPrompt = `Write a GBP post about professional mold remediation.
Mention IICRC certification, safe containment, and air quality testing.
Reference Grand Rapids or West Michigan. Include our website.
Return JSON: { "title": "...", "summary": "...", "callToAction": "Learn More", "callToActionUrl": "${CTA_URLS.mold}" }`;
        break;

      case 'sewage':
        userPrompt = `Write a GBP post about sewage backup cleanup.
Mention biohazard safety, rapid response, and disinfection.
Reference Grand Rapids or West Michigan. Include our phone number.
Return JSON: { "title": "...", "summary": "...", "callToAction": "Call Now", "callToActionUrl": "${CTA_URLS.sewage}" }`;
        break;

      case 'tip':
        userPrompt = `Write a helpful home protection tip related to water damage, mold prevention,
or preparing for seasonal weather in Michigan (${currentMonth}).
End with a subtle mention that we're here if disaster strikes.
Return JSON: { "title": "...", "summary": "...", "callToAction": "Learn More", "callToActionUrl": "${CTA_URLS.tip}" }`;
        break;

      case 'testimonial':
        userPrompt = `Write a GBP post highlighting our 5.0-star rating and 150+ Google reviews.
Tell a brief, realistic customer success story (water damage restored, family back home quickly, etc.)
Reference Grand Rapids or West Michigan. Do not invent names.
Return JSON: { "title": "...", "summary": "...", "callToAction": "Read Our Reviews", "callToActionUrl": "${BUSINESS.googleMapsUrl}" }`;
        break;

      case 'seasonal':
        userPrompt = `Write a seasonal GBP post relevant to ${currentMonth} ${currentYear} in Michigan.
Consider: spring thaw flooding, summer storms, fall basement flooding, winter burst pipes.
Provide practical advice and mention our 24/7 availability.
Return JSON: { "title": "...", "summary": "...", "callToAction": "Call Now", "callToActionUrl": "${CTA_URLS.seasonal}" }`;
        break;
    }

    const responseText = await callClaude(GBP_POST_SYSTEM, userPrompt, 500);

    // Parse JSON from response
    let parsed;
    try {
      // Strip any markdown code fences if present
      const clean = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      // If JSON parsing fails, wrap the raw text into a minimal object
      console.warn(chalk.yellow('Could not parse JSON from AI response — wrapping raw text'));
      parsed = {
        title:           `${SERVICE_NAMES[type]} — ${BUSINESS.name}`,
        summary:         responseText.slice(0, 1500),
        callToAction:    'Learn More',
        callToActionUrl: CTA_URLS[type],
      };
    }

    console.log(chalk.green(`✔ GBP post generated (${parsed.summary?.length || 0} chars)`));
    return parsed;
  } catch (err) {
    console.error(chalk.red(`generateGBPPost failed: ${err.message}`));
    throw err;
  }
}

/**
 * generateReviewReply
 * Generates a professional, personalized reply to a Google review.
 * reviewText: the customer's review content
 * rating: numeric rating (1–5)
 *
 * Returns: string (the reply text)
 */
async function generateReviewReply(reviewText, rating) {
  try {
    console.log(chalk.cyan(`Generating reply to ${rating}-star review...`));

    const tone = rating >= 4
      ? 'warm, grateful, and brief'
      : rating === 3
        ? 'understanding, constructive, and professional'
        : 'empathetic, apologetic, and offering to resolve the issue offline';

    const userPrompt = `Write a reply to this ${rating}-star Google review.
Tone should be: ${tone}.

Review text:
"${reviewText}"

Requirements:
- Under 200 words
- Sign off as "— Ryan Penny, Owner"
- Mention something specific from their review
${rating < 4 ? '- Offer to discuss offline: call us at (616) 822-1978\n- Do NOT be defensive' : ''}
Write only the reply text.`;

    const reply = await callClaude(REVIEW_REPLY_SYSTEM, userPrompt, 400);
    console.log(chalk.green(`✔ Review reply generated (${reply.length} chars)`));
    return reply;
  } catch (err) {
    console.error(chalk.red(`generateReviewReply failed: ${err.message}`));
    throw err;
  }
}

/**
 * generateBacklinkOutreachEmail
 * Generates a professional outreach email for submitting the business to a directory.
 * directory: object from directories.json { name, url, submitUrl, ... }
 *
 * Returns: { subject, body }
 */
async function generateBacklinkOutreachEmail(directory) {
  try {
    console.log(chalk.cyan(`Generating outreach email for: ${directory.name}...`));

    const userPrompt = `Write a professional email to submit our business listing to "${directory.name}" (${directory.url}).

We want to:
${directory.listed ? 'Update our existing listing to correct NAP information' : 'Add a new business listing'}

Include all NAP fields, our IICRC certification, and 5-star Google rating.
Format: Subject line on first line, then blank line, then email body.`;

    const response = await callClaude(OUTREACH_SYSTEM, userPrompt, 500);

    // Split subject from body
    const lines   = response.trim().split('\n');
    let subject   = '';
    let bodyStart = 0;

    // Find the subject line (first non-empty line, possibly prefixed with "Subject:")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        subject   = line.replace(/^Subject:\s*/i, '');
        bodyStart = i + 1;
        // Skip blank line after subject
        if (bodyStart < lines.length && !lines[bodyStart].trim()) bodyStart++;
        break;
      }
    }

    const body = lines.slice(bodyStart).join('\n').trim();

    console.log(chalk.green(`✔ Outreach email generated for ${directory.name}`));
    return { subject, body };
  } catch (err) {
    console.error(chalk.red(`generateBacklinkOutreachEmail failed: ${err.message}`));
    throw err;
  }
}

/**
 * generateFAQAnswer
 * Generates a concise, AEO-optimized answer to a customer question.
 * question: string — the question to answer
 *
 * Returns: string (the answer text, 40–80 words)
 */
async function generateFAQAnswer(question) {
  try {
    console.log(chalk.cyan(`Generating FAQ answer for: "${question}"...`));

    const userPrompt = `Answer this question about our disaster restoration business in a way that could
appear as a Google featured snippet or AI overview:

Question: ${question}

Write a single paragraph of 40–80 words. Start with a direct answer. Include a local detail. End with a soft CTA.`;

    const answer = await callClaude(FAQ_SYSTEM, userPrompt, 200);
    console.log(chalk.green(`✔ FAQ answer generated (${answer.length} chars)`));
    return answer;
  } catch (err) {
    console.error(chalk.red(`generateFAQAnswer failed: ${err.message}`));
    throw err;
  }
}

module.exports = {
  generateGBPPost,
  generateReviewReply,
  generateBacklinkOutreachEmail,
  generateFAQAnswer,
};
