/**
 * gbp-manager.js
 *
 * Google Business Profile (GBP) management agent.
 * Uses the Google My Business API v4 via the googleapis SDK with OAuth2.
 *
 * Functions exported:
 *   getLocationInfo()          — Fetch current GBP listing data
 *   publishPost(postData)      — Create a LOCAL_POST on GBP
 *   getRecentPosts()           — List last 10 posts
 *   getPendingReviews()        — Fetch unanswered reviews
 *   replyToReview(id, text)    — Post a reply to a review
 *   getInsights()              — Fetch views, searches, actions from GBP Insights
 *
 * Prerequisites:
 *   - Google Cloud project with "My Business API" enabled
 *   - OAuth2 credentials (client ID + secret) + a valid refresh token
 *   - GBP_ACCOUNT_ID and GBP_LOCATION_ID set in config.js
 */

'use strict';

const { google }              = require('googleapis');
const chalk                   = require('chalk');
const { config, validateCredentials } = require('../config');

// Required credentials for this agent
const REQUIRED_CREDS = [
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
];

/**
 * getAuthClient
 * Builds and returns an authenticated OAuth2 client.
 * Throws if credentials are missing.
 */
function getAuthClient() {
  const { valid, missing } = validateCredentials(REQUIRED_CREDS);
  if (!valid) {
    throw new Error(
      `GBP Manager: missing credentials: ${missing.join(', ')}. ` +
      'Please fill in config.js before using GBP functions.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    config.GOOGLE_OAUTH_CLIENT_ID,
    config.GOOGLE_OAUTH_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob' // Desktop app redirect
  );

  oauth2Client.setCredentials({
    refresh_token: config.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
}

/**
 * getMyBusinessClient
 * Returns an axios-based request helper pointed at the My Business API v4.
 * The googleapis library does not have a built-in typed client for mybusiness v4,
 * so we use the discovery-based client approach.
 */
async function getMyBusinessClient() {
  const auth = getAuthClient();
  // Get a fresh access token
  const tokenResponse = await auth.getAccessToken();
  const accessToken   = tokenResponse.token;

  return { auth, accessToken };
}

/**
 * buildApiUrl
 * Helper to construct the GBP API base URL for a location.
 */
function buildApiUrl(path = '') {
  const base = `https://mybusiness.googleapis.com/v4/${config.GBP_ACCOUNT_ID}/${config.GBP_LOCATION_ID}`;
  return path ? `${base}/${path}` : base;
}

/**
 * apiRequest
 * Generic authenticated request to the GBP REST API.
 * method: 'GET'|'POST'|'PATCH'|'DELETE'
 * url: full URL
 * body: optional request body object
 */
async function apiRequest(method, url, body = null) {
  const axios = require('axios');
  const { accessToken } = await getMyBusinessClient();

  const config_ = {
    method,
    url,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    validateStatus: () => true, // We handle errors manually
  };

  if (body) config_.data = body;

  const response = await axios(config_);

  if (response.status >= 400) {
    const errMsg = response.data?.error?.message || JSON.stringify(response.data);
    throw new Error(`GBP API error ${response.status}: ${errMsg}`);
  }

  return response.data;
}

// ── Public Functions ──────────────────────────────────────────────────────────

/**
 * getLocationInfo
 * Fetches the full GBP listing data for the configured location.
 * Returns the location object from the API.
 */
async function getLocationInfo() {
  try {
    console.log(chalk.cyan('Fetching GBP location info...'));
    const url  = buildApiUrl();
    const data = await apiRequest('GET', url);
    console.log(chalk.green(`✔ Location: ${data.locationName || data.name}`));
    return data;
  } catch (err) {
    console.error(chalk.red(`getLocationInfo failed: ${err.message}`));
    throw err;
  }
}

/**
 * publishPost
 * Creates a LOCAL_POST on the GBP listing.
 *
 * postData should be:
 * {
 *   summary: string,           // Post body text (required)
 *   callToAction: {            // Optional CTA button
 *     actionType: 'CALL'|'LEARN_MORE'|'VISIT'|'BOOK'|'ORDER'|'SIGN_UP',
 *     url: string              // Required for non-CALL types
 *   },
 *   media: [{ mediaFormat: 'PHOTO', sourceUrl: string }],  // Optional
 *   event: { title, schedule: { startDate, endDate } },    // Optional
 *   topicType: 'STANDARD'|'EVENT'|'OFFER'                  // Defaults STANDARD
 * }
 */
async function publishPost(postData) {
  try {
    console.log(chalk.cyan('Publishing GBP post...'));

    const body = {
      languageCode: 'en-US',
      summary:      postData.summary,
      topicType:    postData.topicType || 'STANDARD',
    };

    if (postData.callToAction) {
      body.callToAction = postData.callToAction;
    }
    if (postData.media && postData.media.length > 0) {
      body.media = postData.media;
    }
    if (postData.event) {
      body.event    = postData.event;
      body.topicType = 'EVENT';
    }

    const url  = buildApiUrl('localPosts');
    const data = await apiRequest('POST', url, body);

    console.log(chalk.green(`✔ Post published! Name: ${data.name}`));

    // Log to posts-log.json
    await logPost({
      gbpName:    data.name,
      summary:    postData.summary,
      topicType:  body.topicType,
      publishedAt: new Date().toISOString(),
    });

    return data;
  } catch (err) {
    console.error(chalk.red(`publishPost failed: ${err.message}`));
    throw err;
  }
}

/**
 * logPost
 * Appends a post record to data/posts-log.json for history tracking.
 */
async function logPost(record) {
  const fse      = require('fs-extra');
  const filePath = require('path').join(__dirname, '../data/posts-log.json');
  try {
    const log = await fse.readJson(filePath).catch(() => []);
    log.push(record);
    await fse.writeJson(filePath, log, { spaces: 2 });
  } catch (err) {
    console.warn(chalk.yellow(`Could not update posts-log.json: ${err.message}`));
  }
}

/**
 * getRecentPosts
 * Returns the last 10 LOCAL_POSTs for the GBP location.
 */
async function getRecentPosts() {
  try {
    console.log(chalk.cyan('Fetching recent GBP posts...'));
    const url  = `${buildApiUrl('localPosts')}?pageSize=10`;
    const data = await apiRequest('GET', url);
    const posts = data.localPosts || [];
    console.log(chalk.green(`✔ Retrieved ${posts.length} recent posts`));
    return posts;
  } catch (err) {
    console.error(chalk.red(`getRecentPosts failed: ${err.message}`));
    throw err;
  }
}

/**
 * getPendingReviews
 * Fetches all reviews for the location and filters for those without a reply.
 * Returns array of unanswered review objects.
 */
async function getPendingReviews() {
  try {
    console.log(chalk.cyan('Fetching pending reviews...'));
    const url  = `${buildApiUrl('reviews')}?pageSize=50`;
    const data = await apiRequest('GET', url);

    const allReviews     = data.reviews || [];
    const pendingReviews = allReviews.filter(r => !r.reviewReply);

    console.log(
      chalk.green(`✔ ${allReviews.length} total reviews, `) +
      chalk.yellow(`${pendingReviews.length} pending reply`)
    );

    return pendingReviews;
  } catch (err) {
    console.error(chalk.red(`getPendingReviews failed: ${err.message}`));
    throw err;
  }
}

/**
 * replyToReview
 * Posts a text reply to a specific review.
 * reviewId: the review resource name (e.g. "accounts/.../locations/.../reviews/...")
 * replyText: string — the reply to post
 */
async function replyToReview(reviewId, replyText) {
  try {
    console.log(chalk.cyan(`Replying to review ${reviewId}...`));

    // reviewId may be a short ID or a full resource name
    const reviewName = reviewId.includes('/')
      ? reviewId
      : `${config.GBP_ACCOUNT_ID}/${config.GBP_LOCATION_ID}/reviews/${reviewId}`;

    const url  = `https://mybusiness.googleapis.com/v4/${reviewName}/reply`;
    const data = await apiRequest('PUT', url, { comment: replyText });

    console.log(chalk.green('✔ Review reply posted successfully'));
    return data;
  } catch (err) {
    console.error(chalk.red(`replyToReview failed: ${err.message}`));
    throw err;
  }
}

/**
 * getInsights
 * Fetches GBP Insights: views, searches, and customer actions.
 * Returns insights for the last 30 days.
 *
 * Note: The Insights endpoint uses reportLocalPostInsights for posts and
 * the locations.reportInsights endpoint for overall metrics.
 */
async function getInsights() {
  try {
    console.log(chalk.cyan('Fetching GBP insights...'));

    const endDate   = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = d => ({
      year:  d.getFullYear(),
      month: d.getMonth() + 1,
      day:   d.getDate(),
    });

    const url  = `https://mybusiness.googleapis.com/v4/${config.GBP_ACCOUNT_ID}/locations:reportInsights`;
    const body = {
      locationNames: [`${config.GBP_ACCOUNT_ID}/${config.GBP_LOCATION_ID}`],
      basicRequest: {
        metricRequests: [
          { metric: 'QUERIES_DIRECT' },
          { metric: 'QUERIES_INDIRECT' },
          { metric: 'QUERIES_CHAIN' },
          { metric: 'VIEWS_MAPS' },
          { metric: 'VIEWS_SEARCH' },
          { metric: 'ACTIONS_WEBSITE' },
          { metric: 'ACTIONS_PHONE' },
          { metric: 'ACTIONS_DRIVING_DIRECTIONS' },
        ],
        timeRange: {
          startTime: startDate.toISOString(),
          endTime:   endDate.toISOString(),
        },
      },
    };

    const data = await apiRequest('POST', url, body);
    console.log(chalk.green('✔ Insights fetched'));
    return data;
  } catch (err) {
    console.error(chalk.red(`getInsights failed: ${err.message}`));
    throw err;
  }
}

module.exports = {
  getLocationInfo,
  publishPost,
  getRecentPosts,
  getPendingReviews,
  replyToReview,
  getInsights,
};
