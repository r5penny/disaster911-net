/**
 * review-responder.js
 *
 * Automated review management agent for Disaster Response by Ryan.
 * Fetches Google Business Profile reviews, drafts AI replies for approval,
 * tracks rating trends, and generates weekly reports.
 *
 * IMPORTANT: autoRespondToReview() drafts replies and logs them for human
 * approval — it does NOT auto-post without confirmation by default.
 *
 * Functions exported:
 *   checkForNewReviews()           — Fetch unanswered reviews from GBP
 *   autoRespondToReview(review)    — Draft reply + log for approval
 *   getReviewStats()               — Rating breakdown, average, trend
 *   flagNegativeReviews()          — Highlight reviews below 4 stars
 *   generateWeeklyReviewReport()   — Summary of review activity
 */

'use strict';

const chalk = require('chalk');
const ora   = require('ora');
const path  = require('path');
const fs    = require('fs-extra');
const { BUSINESS, validateCredentials } = require('../config');

const REPORTS_DIR    = path.join(__dirname, '../reports');
const REVIEW_LOG     = path.join(__dirname, '../data/review-drafts.json');

// Star rating labels
const RATING_LABELS = { 1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE' };
const RATING_FROM_LABEL = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

// ── GBP dependency (lazy require to avoid crash if credentials missing) ───────

function getGBPManager() {
  try {
    return require('./gbp-manager');
  } catch (err) {
    return null;
  }
}

function getContentGenerator() {
  try {
    return require('./content-generator');
  } catch (err) {
    return null;
  }
}

/**
 * normalizeRating
 * GBP API returns ratings as string labels like "FIVE". Convert to integer.
 */
function normalizeRating(rating) {
  if (typeof rating === 'number') return rating;
  if (typeof rating === 'string') {
    return RATING_FROM_LABEL[rating.toUpperCase()] || parseInt(rating, 10) || 0;
  }
  return 0;
}

/**
 * loadReviewLog
 * Reads the local review-drafts.json log. Returns empty array if file doesn't exist.
 */
async function loadReviewLog() {
  try {
    return await fs.readJson(REVIEW_LOG);
  } catch {
    return [];
  }
}

/**
 * saveReviewLog
 * Writes the review drafts log back to disk.
 */
async function saveReviewLog(log) {
  await fs.ensureDir(path.dirname(REVIEW_LOG));
  await fs.writeJson(REVIEW_LOG, log, { spaces: 2 });
}

// ── Exported Functions ────────────────────────────────────────────────────────

/**
 * checkForNewReviews
 * Fetches all reviews from GBP and filters for unanswered ones.
 * Returns array of pending review objects.
 */
async function checkForNewReviews() {
  const creds = validateCredentials([
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
  ]);

  if (!creds.valid) {
    console.warn(chalk.yellow(
      `Review Responder: GBP credentials not set (${creds.missing.join(', ')}). ` +
      'Returning empty review list.'
    ));
    return [];
  }

  try {
    const gbp     = getGBPManager();
    if (!gbp) throw new Error('gbp-manager module not available');

    const pending = await gbp.getPendingReviews();
    console.log(chalk.cyan(`Found ${pending.length} reviews awaiting a reply.`));
    return pending;
  } catch (err) {
    console.error(chalk.red(`checkForNewReviews failed: ${err.message}`));
    throw err;
  }
}

/**
 * autoRespondToReview
 * Drafts a reply to a review using AI and saves it to review-drafts.json
 * for human review before posting.
 *
 * Does NOT post automatically unless the returned draft is manually approved
 * and passed to gbp-manager.replyToReview().
 *
 * review: GBP review object from the API
 * Returns: { reviewId, draft, savedToLog: bool }
 */
async function autoRespondToReview(review) {
  try {
    const reviewId   = review.reviewId || review.name;
    const reviewText = review.comment || '(No comment left — rating only)';
    const rating     = normalizeRating(review.starRating);
    const reviewer   = review.reviewer?.displayName || 'Valued Customer';

    console.log(chalk.cyan(`\nDrafting reply for ${rating}-star review from ${reviewer}...`));
    console.log(chalk.gray(`Review: "${reviewText.slice(0, 100)}${reviewText.length > 100 ? '...' : ''}"`));

    // Generate AI reply
    const contentGen = getContentGenerator();
    if (!contentGen) {
      throw new Error('content-generator module not available');
    }

    const { valid: aiValid } = validateCredentials(['ANTHROPIC_API_KEY']);
    let draft;

    if (aiValid) {
      draft = await contentGen.generateReviewReply(reviewText, rating);
    } else {
      // Fallback template if AI not available
      draft = generateFallbackReply(reviewer, rating, reviewText);
      console.warn(chalk.yellow('Using fallback template reply (ANTHROPIC_API_KEY not set)'));
    }

    console.log(chalk.bold('\nGenerated Reply Draft:'));
    console.log(chalk.white('─'.repeat(60)));
    console.log(draft);
    console.log(chalk.white('─'.repeat(60)));

    // Save to log for approval
    const log = await loadReviewLog();
    const entry = {
      reviewId,
      reviewer,
      rating,
      reviewText,
      reviewDate:  review.createTime || new Date().toISOString(),
      draftReply:  draft,
      draftedAt:   new Date().toISOString(),
      status:      'pending_approval',  // 'pending_approval' | 'approved' | 'posted' | 'skipped'
      postedAt:    null,
    };

    // Check if this review already has a draft
    const existingIdx = log.findIndex(e => e.reviewId === reviewId);
    if (existingIdx >= 0) {
      log[existingIdx] = { ...log[existingIdx], ...entry, status: 'pending_approval' };
    } else {
      log.push(entry);
    }

    let savedToLog = false;
    try {
      await saveReviewLog(log);
      savedToLog = true;
      console.log(chalk.green('\n✔ Draft saved to data/review-drafts.json for approval'));
      console.log(chalk.gray('To post: use option 6 in the main menu to approve and publish'));
    } catch (saveErr) {
      console.warn(chalk.yellow(`Could not save draft: ${saveErr.message}`));
    }

    return { reviewId, draft, savedToLog };
  } catch (err) {
    console.error(chalk.red(`autoRespondToReview failed: ${err.message}`));
    throw err;
  }
}

/**
 * generateFallbackReply
 * Template-based reply when Claude AI is unavailable.
 */
function generateFallbackReply(reviewer, rating, reviewText) {
  if (rating >= 5) {
    return `Thank you so much for the wonderful review! We're thrilled that we could help you through a stressful situation and that you're happy with the restoration work. Your kind words mean a lot to our team.

We take pride in providing fast, professional service to every homeowner in Grand Rapids and the West Michigan area. If you ever need us again, please don't hesitate to call — we're available 24/7 at ${BUSINESS.phone}.

— Ryan Penny, Owner`;
  }

  if (rating >= 4) {
    return `Thank you for taking the time to leave a review and for choosing Disaster Response by Ryan! We're glad we could help restore your property and get things back to normal.

If there's anything we could have done to make your experience even better, I'd love to hear about it. Feel free to call me directly at ${BUSINESS.phone}.

— Ryan Penny, Owner`;
  }

  // 1–3 stars
  return `Thank you for your feedback. I'm sorry to hear your experience didn't fully meet expectations — that's not the standard we hold ourselves to.

I'd like to personally address your concerns. Please call me directly at ${BUSINESS.phone} so we can make this right. Your satisfaction matters to us.

— Ryan Penny, Owner`;
}

/**
 * getReviewStats
 * Returns rating breakdown, weighted average, and recent trend.
 * Uses reviews fetched from GBP if credentials available, else returns placeholder.
 */
async function getReviewStats() {
  const stats = {
    totalReviews:   BUSINESS.reviewCount,
    averageRating:  BUSINESS.rating,
    breakdown:      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    trend:          null,
    source:         'config defaults (GBP API not connected)',
    asOf:           new Date().toISOString(),
  };

  const creds = validateCredentials([
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
  ]);

  if (!creds.valid) {
    console.warn(chalk.yellow('Using hardcoded review stats (GBP credentials not set)'));
    return stats;
  }

  try {
    const gbp     = getGBPManager();
    const apiUrl  = `https://mybusiness.googleapis.com/v4/${require('../config').config.GBP_ACCOUNT_ID}/${require('../config').config.GBP_LOCATION_ID}/reviews?pageSize=50`;

    // We re-use apiRequest from gbp-manager indirectly via the module
    // For simplicity, call getPendingReviews which internally fetches all
    // Then we parse from the raw response — but gbp-manager only returns pending.
    // Instead, directly use location info which includes aggregate rating.
    const location = await gbp.getLocationInfo();

    if (location?.metadata?.mapsUrl) {
      stats.source = 'GBP API';
    }

    // GBP API includes aggregate in metadata for some account types
    if (location?.metadata?.totalReviewCount) {
      stats.totalReviews  = location.metadata.totalReviewCount;
    }
    if (location?.metadata?.averageRating) {
      stats.averageRating = location.metadata.averageRating;
    }

  } catch (err) {
    console.warn(chalk.yellow(`Could not fetch live review stats: ${err.message} — using defaults`));
  }

  return stats;
}

/**
 * flagNegativeReviews
 * Fetches all reviews and highlights those below 4 stars for immediate attention.
 * Returns array of negative review objects with suggested actions.
 */
async function flagNegativeReviews() {
  const creds = validateCredentials([
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
  ]);

  if (!creds.valid) {
    console.warn(chalk.yellow('GBP credentials not set — cannot fetch live reviews'));
    return [];
  }

  try {
    const gbp         = getGBPManager();
    const allPending  = await gbp.getPendingReviews();

    const negative = allPending.filter(r => normalizeRating(r.starRating) < 4);

    if (negative.length === 0) {
      console.log(chalk.green('✔ No unanswered negative reviews found!'));
      return [];
    }

    console.log(chalk.red.bold(`\n⚠ ${negative.length} NEGATIVE REVIEW(S) NEED ATTENTION:\n`));

    negative.forEach((review, i) => {
      const rating   = normalizeRating(review.starRating);
      const reviewer = review.reviewer?.displayName || 'Anonymous';
      const text     = review.comment || '(no comment)';
      const date     = review.createTime
        ? new Date(review.createTime).toLocaleDateString('en-US')
        : 'unknown date';

      console.log(chalk.red(`${i + 1}. ${rating}⭐ — ${reviewer} (${date})`));
      console.log(chalk.white(`   "${text.slice(0, 200)}${text.length > 200 ? '...' : ''}"`));
      console.log(chalk.yellow(`   Action: Draft reply and respond within 24 hours`));
      console.log('');
    });

    return negative.map(r => ({
      reviewId:  r.reviewId || r.name,
      reviewer:  r.reviewer?.displayName || 'Anonymous',
      rating:    normalizeRating(r.starRating),
      text:      r.comment,
      date:      r.createTime,
      urgent:    normalizeRating(r.starRating) <= 2,
    }));
  } catch (err) {
    console.error(chalk.red(`flagNegativeReviews failed: ${err.message}`));
    throw err;
  }
}

/**
 * generateWeeklyReviewReport
 * Creates a summary of review activity for the past 7 days.
 * Returns and saves a report object.
 */
async function generateWeeklyReviewReport() {
  console.log(chalk.cyan('\nGenerating weekly review report...'));

  const weekAgo   = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Load draft log for activity stats
  const draftLog  = await loadReviewLog();
  const recentDrafts = draftLog.filter(e => new Date(e.draftedAt) >= weekAgo);

  const report = {
    type:          'weekly-review-report',
    period:        `${weekAgo.toLocaleDateString('en-US')} – ${new Date().toLocaleDateString('en-US')}`,
    generatedAt:   new Date().toISOString(),
    business:      BUSINESS.name,
    overallStats: {
      totalReviews:  BUSINESS.reviewCount,
      averageRating: BUSINESS.rating,
      note:          'Live breakdown requires GBP API credentials',
    },
    weekActivity: {
      draftsCreated:   recentDrafts.length,
      repliesApproved: recentDrafts.filter(e => e.status === 'approved' || e.status === 'posted').length,
      repliesPosted:   recentDrafts.filter(e => e.status === 'posted').length,
      pendingApproval: recentDrafts.filter(e => e.status === 'pending_approval').length,
    },
    pendingDrafts: draftLog.filter(e => e.status === 'pending_approval').map(e => ({
      reviewId:   e.reviewId,
      reviewer:   e.reviewer,
      rating:     e.rating,
      draftedAt:  e.draftedAt,
    })),
    recommendations: [],
  };

  // Build recommendations
  if (report.weekActivity.pendingApproval > 0) {
    report.recommendations.push(
      `${report.weekActivity.pendingApproval} review reply draft(s) awaiting approval — approve and post to improve engagement`
    );
  }
  if (BUSINESS.rating < 4.8) {
    report.recommendations.push('Rating below 4.8 — proactively ask satisfied customers to leave reviews');
  }
  if (BUSINESS.reviewCount < 200) {
    report.recommendations.push('Under 200 reviews — add a review request to your follow-up workflow');
  }

  // Save report
  await fs.ensureDir(REPORTS_DIR);
  const timestamp  = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORTS_DIR, `weekly-review-report-${timestamp}.json`);

  try {
    await fs.writeJson(reportPath, report, { spaces: 2 });
    console.log(chalk.gray(`Report saved: ${reportPath}`));
  } catch (err) {
    console.warn(chalk.yellow(`Could not save report: ${err.message}`));
  }

  // Print summary
  console.log(chalk.bold.white('\nWEEKLY REVIEW SUMMARY'));
  console.log(`  Overall Rating:  ${chalk.green(BUSINESS.rating + '⭐')} (${BUSINESS.reviewCount}+ reviews)`);
  console.log(`  Drafts Created:  ${chalk.cyan(report.weekActivity.draftsCreated)}`);
  console.log(`  Replies Posted:  ${chalk.green(report.weekActivity.repliesPosted)}`);
  console.log(`  Pending Approval: ${chalk.yellow(report.weekActivity.pendingApproval)}`);

  if (report.recommendations.length > 0) {
    console.log(chalk.bold.yellow('\nRecommendations:'));
    report.recommendations.forEach(r => console.log(chalk.yellow(`  • ${r}`)));
  }

  console.log('');
  return report;
}

module.exports = {
  checkForNewReviews,
  autoRespondToReview,
  getReviewStats,
  flagNegativeReviews,
  generateWeeklyReviewReport,
};
